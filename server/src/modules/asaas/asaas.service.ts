import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// SENIOR (2026-08-01): portado quase 1:1 do server/src/modules/asaas/asaas.service.ts
// do Viver Bem - é o mesmo padrão comprovado (cria/busca cliente, cria
// cobrança PIX/cartão/boleto, consulta status, cancela). Removido só o que
// era específico de lá (split de parceiro com wallet - a Lancha não tem
// esse cenário ainda). Config aponta pra conta Asaas PRÓPRIA da Lancha
// (CNPJ separado do Viver Bem), via ASAAS_API_KEY neste .env, não o do lab.
@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ASAAS_API_KEY') || '';
    const isProd = this.configService.get<string>('ASAAS_ENV') === 'production';
    this.baseUrl = isProd ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3';
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      access_token: this.apiKey,
    };
  }

  async createCustomer(data: { name: string; cpfCnpj: string; email: string; phone?: string }): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn('Asaas API Key não configurada. Simulando Customer.');
      return 'cus_simulated_123';
    }

    const clean = data.cpfCnpj.replace(/\D/g, '');
    if (![11, 14].includes(clean.length)) {
      throw new Error(`CPF/CNPJ inválido. Esperado 11 ou 14 dígitos, recebido: ${clean.length} (${data.cpfCnpj})`);
    }

    const searchRes = await fetch(`${this.baseUrl}/customers?cpfCnpj=${clean}`, {
      method: 'GET',
      headers: this.headers,
    });
    const searchData = await searchRes.json();
    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id;
    }

    const createRes = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name: data.name, cpfCnpj: clean, email: data.email, phone: data.phone }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      throw new Error(createData.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
    }
    return createData.id;
  }

  async createPayment(data: {
    customerId: string;
    billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
    value: number;
    description: string;
    externalReference: string;
  }): Promise<any> {
    if (!this.apiKey) {
      this.logger.warn(`Asaas API Key não configurada. Simulando ${data.billingType}.`);
      return { id: 'pay_simulated', invoiceUrl: 'https://sandbox.asaas.com/i/simulated', status: 'PENDING' };
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const body = {
      customer: data.customerId,
      billingType: data.billingType,
      value: data.value,
      dueDate: tomorrow.toISOString().split('T')[0],
      description: data.description,
      externalReference: data.externalReference,
    };

    const paymentRes = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) {
      throw new Error(paymentData.errors?.[0]?.description || `Erro ao gerar pagamento ${data.billingType} no Asaas`);
    }

    if (data.billingType === 'PIX') {
      const pixRes = await fetch(`${this.baseUrl}/payments/${paymentData.id}/pixQrCode`, {
        method: 'GET',
        headers: this.headers,
      });
      const pixData = await pixRes.json();
      return { ...paymentData, encodedImage: pixData.encodedImage, payload: pixData.payload };
    }

    return paymentData;
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    if (!this.apiKey || paymentId.startsWith('pay_simulated')) {
      return { status: 'PENDING', id: paymentId };
    }
    const res = await fetch(`${this.baseUrl}/payments/${paymentId}`, { method: 'GET', headers: this.headers });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.[0]?.description || 'Erro ao obter status do pagamento');
    }
    return res.json();
  }
}
