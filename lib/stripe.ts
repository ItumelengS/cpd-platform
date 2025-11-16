import Stripe from 'stripe';

// Initialize Stripe with the latest API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Creates a Stripe Connect Express account for a creator
 * @param userId - The user's database ID
 * @param email - The user's email address
 * @returns The Stripe account ID
 */
export async function createConnectAccount(
  userId: string,
  email: string
): Promise<string> {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: userId,
      },
    });

    return account.id;
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    throw new Error('Failed to create Stripe Connect account');
  }
}

/**
 * Creates an account link for Stripe Connect onboarding
 * @param accountId - The Stripe account ID
 * @param refreshUrl - URL to redirect if the link expires
 * @param returnUrl - URL to redirect after successful onboarding
 * @returns The onboarding URL
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw new Error('Failed to create account link');
  }
}

/**
 * Creates a payout (transfer) to a creator's Stripe Connect account
 * @param accountId - The Stripe Connect account ID
 * @param amount - Amount in dollars
 * @param description - Description for the transfer
 * @returns The Stripe transfer object
 */
export async function createPayout(
  accountId: string,
  amount: number,
  description: string
): Promise<Stripe.Transfer> {
  try {
    // Convert dollars to cents
    const amountInCents = Math.round(amount * 100);

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: accountId,
      description: description,
      metadata: {
        type: 'creator_payout',
      },
    });

    return transfer;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw new Error('Failed to create payout');
  }
}

/**
 * Gets the status of a Stripe Connect account
 * @param accountId - The Stripe account ID
 * @returns Account status information
 */
export async function getAccountStatus(accountId: string): Promise<{
  onboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}> {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      onboarded: account.details_submitted && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
      },
    };
  } catch (error) {
    console.error('Error retrieving account status:', error);
    throw new Error('Failed to retrieve account status');
  }
}

/**
 * Retrieves bank account details (last 4 digits) from a Stripe Connect account
 * @param accountId - The Stripe account ID
 * @returns Bank account information if available
 */
export async function getBankAccountInfo(accountId: string): Promise<{
  bankName?: string;
  last4?: string;
  routingNumber?: string;
} | null> {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    if (account.external_accounts?.data && account.external_accounts.data.length > 0) {
      const bankAccount = account.external_accounts.data[0] as Stripe.BankAccount;

      return {
        bankName: bankAccount.bank_name || undefined,
        last4: bankAccount.last4,
        routingNumber: bankAccount.routing_number || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error retrieving bank account info:', error);
    return null;
  }
}

/**
 * Retrieves a Stripe transfer by ID
 * @param transferId - The Stripe transfer ID
 * @returns The transfer object
 */
export async function getTransfer(transferId: string): Promise<Stripe.Transfer> {
  try {
    return await stripe.transfers.retrieve(transferId);
  } catch (error) {
    console.error('Error retrieving transfer:', error);
    throw new Error('Failed to retrieve transfer');
  }
}
