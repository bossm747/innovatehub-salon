import fetch from 'node-fetch';

interface PaymentConfig {
  apiUrl: string;
  token: string;
}

interface QRPHGenerateRequest {
  amount: number;
}

interface QRPHGenerateResponse {
  referenceNumber: string;
  qrCode: string;
  amount: number;
  status: string;
  expiryDate: string;
}

interface TransactionStatusResponse {
  referenceNumber: string;
  amount: number;
  status: string; // 'pending', 'completed', 'failed', 'expired'
  paymentDate?: string;
  payerName?: string;
  payerAccount?: string;
}

export class PaymentGateway {
  private config: PaymentConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.PLATAPAY_API_URL || '',
      token: process.env.PLATAPAY_TOKEN || ''
    };

    if (!this.config.apiUrl || !this.config.token) {
      console.warn('PlataPay configuration missing. Payment gateway will use fallback mode.');
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST', data?: any) {
    if (!this.config.apiUrl || !this.config.token) {
      throw new Error('Payment gateway not configured');
    }

    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Payment API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate QRPH payment request
   */
  async generateQRPayment(amount: number): Promise<QRPHGenerateResponse> {
    try {
      const response = await this.makeRequest('/allbank/qrph/generate', 'POST', {
        amount: parseFloat(amount.toFixed(2))
      }) as any;

      return {
        referenceNumber: response.referenceNumber || `QR-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        qrCode: response.qrCode || response.qr_code || '',
        amount: response.amount || amount,
        status: response.status || 'pending',
        expiryDate: response.expiryDate || response.expiry_date || ''
      };
    } catch (error) {
      console.error('QRPH Generation Error:', error);
      // Fallback for testing/demo purposes
      return {
        referenceNumber: `DEMO-QR-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        amount,
        status: 'pending',
        expiryDate: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
      };
    }
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(referenceNumber: string): Promise<TransactionStatusResponse> {
    try {
      const response = await this.makeRequest(`/allbank/qrph/transactions/${referenceNumber}`, 'GET') as any;

      return {
        referenceNumber: response.referenceNumber || response.reference_number || referenceNumber,
        amount: response.amount || 0,
        status: response.status || 'pending',
        paymentDate: response.paymentDate || response.payment_date,
        payerName: response.payerName || response.payer_name,
        payerAccount: response.payerAccount || response.payer_account
      };
    } catch (error) {
      console.error('Transaction Status Check Error:', error);
      // Return pending status for unknown transactions
      return {
        referenceNumber,
        amount: 0,
        status: 'pending'
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(pageNumber: number = 1, pageSize: number = 10, userId?: string) {
    try {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        searchQuery: ''
      });

      if (userId) {
        params.append('userId', userId);
      }

      return await this.makeRequest(`/allbank/qrph/transactions?${params.toString()}`, 'GET');
    } catch (error) {
      console.error('Transaction History Error:', error);
      return {
        total_records: 0,
        page_number: pageNumber,
        page_size: pageSize,
        data: []
      };
    }
  }

  /**
   * Process other payment methods (GCash, Maya, etc.)
   * These would typically redirect to respective payment gateways
   */
  async processDigitalPayment(paymentMethod: string, amount: number, customerInfo?: any) {
    // For QRPH-compatible payments, generate QR code
    if (['qrph', 'gcash', 'maya'].includes(paymentMethod.toLowerCase())) {
      return await this.generateQRPayment(amount);
    }

    // For card payments, this would typically redirect to a payment processor
    if (paymentMethod === 'card') {
      return {
        referenceNumber: `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        redirectUrl: '#', // Would be actual card processor URL
        amount,
        status: 'pending'
      };
    }

    throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }

  /**
   * Validate payment configuration
   */
  isConfigured(): boolean {
    return !!(this.config.apiUrl && this.config.token);
  }
}

export const paymentGateway = new PaymentGateway();