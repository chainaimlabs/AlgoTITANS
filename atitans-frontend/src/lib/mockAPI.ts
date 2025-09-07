import billsOfLadingData from '../data/mockBillsOfLading.json';
import { BillOfLading, TokenizedBL, Investment, UserRole } from '../interfaces/types';

class MockAlgoTitansAPI {
  private billsOfLading: BillOfLading[] = (billsOfLadingData as any[]).map(bl => ({
    ...bl,
    invoicePayableAt: bl.invoicePayableAt?.UNLocationCode || 'DESTINATION',
    charges: bl.charges || []
  }));
  private tokenizedBLs: TokenizedBL[] = [];
  private investments: Investment[] = [];
  private users: UserRole[] = [];

  // Simulate API delays for realistic demo
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Bills of Lading Operations
  async getBillsOfLading(): Promise<BillOfLading[]> {
    await this.delay(300);
    return this.billsOfLading;
  }

  async getFinanciableBLs(): Promise<BillOfLading[]> {
    await this.delay(250);
    return this.billsOfLading.filter(bl => bl.canBeFinanced);
  }

  async getNonFinanciableBLs(): Promise<BillOfLading[]> {
    await this.delay(250);
    return this.billsOfLading.filter(bl => !bl.canBeFinanced);
  }

  async getBLByReference(reference: string): Promise<BillOfLading | null> {
    await this.delay(200);
    return this.billsOfLading.find(bl => bl.transportDocumentReference === reference) || null;
  }

  // Tokenization Operations
  async tokenizeBL(blReference: string, shares: number, pricePerShare: number): Promise<TokenizedBL> {
    await this.delay(500); // Simulate blockchain transaction
    
    const bl = await this.getBLByReference(blReference);
    if (!bl || !bl.canBeFinanced) {
      throw new Error('BL cannot be tokenized');
    }

    const tokenizedBL: TokenizedBL = {
      blReference,
      tokenId: Date.now(),
      totalShares: shares,
      availableShares: shares,
      pricePerShare,
      expectedYield: bl.rwaTokenization.expectedYield,
      riskRating: bl.rwaTokenization.riskRating,
      fundingProgress: 0,
      investors: 0,
      status: 'FUNDING'
    };

    this.tokenizedBLs.push(tokenizedBL);
    return tokenizedBL;
  }

  async getTokenizedBLs(): Promise<TokenizedBL[]> {
    await this.delay(250);
    return this.tokenizedBLs;
  }

  async getActiveOpportunities(): Promise<TokenizedBL[]> {
    await this.delay(300);
    return this.tokenizedBLs.filter(tbl => tbl.status === 'FUNDING' && tbl.availableShares > 0);
  }

  // Investment Operations
  async makeInvestment(blReference: string, shares: number, investor: string): Promise<Investment> {
    await this.delay(600); // Simulate atomic settlement
    
    const tokenizedBL = this.tokenizedBLs.find(tbl => tbl.blReference === blReference);
    if (!tokenizedBL || tokenizedBL.availableShares < shares) {
      throw new Error('Insufficient shares available');
    }

    const investment: Investment = {
      id: `INV-${Date.now()}`,
      blReference,
      shares,
      amountInvested: shares * tokenizedBL.pricePerShare,
      expectedReturn: (shares * tokenizedBL.pricePerShare * tokenizedBL.expectedYield) / 100,
      purchaseDate: new Date().toISOString(),
      status: 'ACTIVE',
      investor
    };

    // Update tokenized BL
    tokenizedBL.availableShares -= shares;
    tokenizedBL.fundingProgress = ((tokenizedBL.totalShares - tokenizedBL.availableShares) / tokenizedBL.totalShares) * 100;
    tokenizedBL.investors += 1;

    this.investments.push(investment);
    return investment;
  }

  async getUserInvestments(investor: string): Promise<Investment[]> {
    await this.delay(250);
    return this.investments.filter(inv => inv.investor === investor);
  }

  // User Management
  async createUser(address: string, role: UserRole['role'], name: string, company?: string): Promise<UserRole> {
    await this.delay(200);
    
    const user: UserRole = {
      address,
      role,
      name,
      company,
      verified: true,
      balance: role === 'EXPORTER' ? 1000000 : role === 'CARRIER' ? 500000 : 10000 // microAlgos
    };

    this.users.push(user);
    return user;
  }

  async getUserByAddress(address: string): Promise<UserRole | null> {
    await this.delay(100);
    return this.users.find(user => user.address === address) || null;
  }

  async getUsers(): Promise<UserRole[]> {
    await this.delay(200);
    return this.users;
  }

  // Statistics
  async getMarketplaceStats() {
    await this.delay(200);
    
    const totalBLs = this.billsOfLading.length;
    const financiableBLs = this.billsOfLading.filter(bl => bl.canBeFinanced).length;
    const tokenizedBLs = this.tokenizedBLs.length;
    const totalValue = this.billsOfLading.reduce((sum, bl) => sum + bl.declaredValue.amount, 0);
    const totalInvestments = this.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const activeInvestors = new Set(this.investments.map(inv => inv.investor)).size;

    return {
      totalBLs,
      financiableBLs,
      nonFinanciableBLs: totalBLs - financiableBLs,
      tokenizedBLs,
      totalValue,
      totalInvestments,
      activeInvestors,
      averageYield: financiableBLs > 0 ? 
        this.billsOfLading
          .filter(bl => bl.canBeFinanced)
          .reduce((sum, bl) => sum + bl.rwaTokenization.expectedYield, 0) / financiableBLs : 0
    };
  }

  // Simulate real-time updates
  subscribeToUpdates(callback: (update: any) => void) {
    setInterval(() => {
      if (this.tokenizedBLs.length > 0) {
        const randomBL = this.tokenizedBLs[Math.floor(Math.random() * this.tokenizedBLs.length)];
        const newInvestment = Math.floor(Math.random() * 10) + 1;
        
        if (randomBL.availableShares >= newInvestment) {
          randomBL.availableShares -= newInvestment;
          randomBL.fundingProgress = ((randomBL.totalShares - randomBL.availableShares) / randomBL.totalShares) * 100;
          randomBL.investors += 1;

          callback({
            type: 'investment_update',
            data: {
              blReference: randomBL.blReference,
              newShares: newInvestment,
              remainingShares: randomBL.availableShares,
              fundingProgress: randomBL.fundingProgress,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    }, 8000); // Update every 8 seconds
  }

  // Generate sample tokenized BLs for demo
  async initializeDemoData() {
    const financiableBLs = this.billsOfLading.filter(bl => bl.canBeFinanced);
    
    // Tokenize first two BLs for demo
    if (financiableBLs.length >= 2) {
      await this.tokenizeBL(financiableBLs[0].transportDocumentReference, 3000, 50);
      await this.tokenizeBL(financiableBLs[1].transportDocumentReference, 1500, 50);
      
      // Simulate some initial investments
      await this.makeInvestment(financiableBLs[0].transportDocumentReference, 847, 'demo-investor-1');
      await this.makeInvestment(financiableBLs[1].transportDocumentReference, 234, 'demo-investor-2');
    }
  }
}

export const mockAPI = new MockAlgoTitansAPI();

// Initialize demo data
mockAPI.initializeDemoData();
