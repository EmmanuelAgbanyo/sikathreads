import { OrderRequest, StyleMatchRequest, SourcingRequest } from '../types';

export interface EmailJob {
  id: string;
  referenceId: string; // Order reference or StyleMatch ID
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type:
    | 'stylematch_ack'
    | 'stylematch_admin_alert'
    | 'stylematch_approved_recommendations'
    | 'stylematch_delay_notice'
    | 'stylematch_no_stock_sourcing'
    | 'order_request_ack'
    | 'order_admin_alert'
    | 'order_status_update'
    | 'order_confirmed'
    | 'order_dispatched'
    | 'order_pickup_ready'
    | 'sourcing_ack'
    | 'sourcing_proposal';
  status: 'sent' | 'queued' | 'failed';
  providerMessageId: string;
  sentAt: string;
  idempotencyKey: string;
  htmlBody: string;
  textBody: string;
}

const EMAIL_JOBS_KEY = 'sika_email_jobs';

export class EmailService {
  static getEmailJobs(): EmailJob[] {
    try {
      const stored = localStorage.getItem(EMAIL_JOBS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static recordJob(job: EmailJob): void {
    const jobs = this.getEmailJobs();
    jobs.unshift(job);
    localStorage.setItem(EMAIL_JOBS_KEY, JSON.stringify(jobs.slice(0, 200)));
  }

  private static generateEmailWrapper(contentHtml: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F6; color: #20201D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E8E2D5; }
    .header { background-color: #20201D; padding: 24px; text-align: center; border-bottom: 3px solid #B8863B; }
    .header h1 { color: #FAF9F6; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; letter-spacing: 2px; }
    .tagline { color: #B8863B; font-size: 12px; margin-top: 6px; letter-spacing: 1px; font-weight: 500; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .footer { background-color: #FAF9F6; padding: 20px 24px; text-align: center; font-size: 12px; color: #70706B; border-top: 1px solid #E8E2D5; }
    .button { display: inline-block; background-color: #B8863B; color: #FFFFFF !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 16px; }
    .product-box { border: 1px solid #E8E2D5; border-radius: 6px; padding: 16px; margin-bottom: 16px; background-color: #FAF9F6; }
    .badge { display: inline-block; background-color: #8B2635; color: #FFFFFF; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SIKA THREADS</h1>
      <div class="tagline">Weaving Heritage, Stitching Modernity.</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>Sika Threads Ghana</strong></p>
      <p>Customer Concierge: Nationwide Delivery &amp; Arranged Collection</p>
      <p>Phone: +233 (0) 55 771 8472 | WhatsApp: +233 55 771 8472</p>
      <p style="margin-top: 12px; font-style: italic; color: #B8863B;">Weaving Heritage, Stitching Modernity.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // 1. Order Request Acknowledgement to Customer
  static sendOrderAcknowledgement(order: OrderRequest): EmailJob {
    const itemsListHtml = order.items
      .map(
        (i) => `
      <div class="product-box">
        <strong>${i.name}</strong><br/>
        <span>Fabric: ${i.fabricType}</span><br/>
        <span>Quantity: ${i.quantity} ${i.sellingUnit} &bull; Unit Price: GHS ${i.price}</span><br/>
        <strong style="color: #8B2635;">Line Total: GHS ${i.lineTotal.toLocaleString()}</strong>
      </div>
    `
      )
      .join('');

    const bodyHtml = `
      <h2 style="font-family: Georgia, serif; color: #20201D; margin-top: 0;">Order Request Received: ${order.orderReference}</h2>
      <p>Dear ${order.customer.name},</p>
      <p style="background-color: #FAF9F6; padding: 14px; border-left: 4px solid #B8863B; font-weight: 500;">
        <strong>Notice:</strong> Thank you for choosing Sika Threads. Your order request has been received. Our team will confirm product availability, final pricing, and delivery arrangements with you.
      </p>
      <p>Please note that submitting an order request does not mean that payment has been taken or that stock has been irreversibly locked. A Sika Threads concierge is reviewing your request now.</p>
      
      <h3 style="color: #20201D; border-bottom: 1px solid #E8E2D5; padding-bottom: 6px;">Requested Items:</h3>
      ${itemsListHtml}

      <div style="margin-top: 20px; padding: 16px; background-color: #FAF9F6; border-radius: 6px;">
        <p style="margin: 4px 0;"><strong>Proposed Subtotal:</strong> GHS ${order.subtotal.toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Proposed Delivery (${order.customer.deliveryPreference === 'delivery' ? order.customer.address?.region || 'Ghana' : 'Direct Pickup / Collection'}):</strong> GHS ${order.proposedDeliveryFee.toLocaleString()}</p>
        <p style="margin: 8px 0; font-size: 18px; color: #8B2635;"><strong>Estimated Total: GHS ${order.proposedTotal.toLocaleString()}</strong></p>
      </div>

      <p style="margin-top: 24px;">Our representative will reach out via <strong>${order.customer.phone || order.customer.email}</strong> to finalize cutting specifications and schedule delivery.</p>
    `;

    const job: EmailJob = {
      id: 'em-' + Date.now(),
      referenceId: order.orderReference,
      recipientEmail: order.customer.email,
      recipientName: order.customer.name,
      subject: `Order Request Received: ${order.orderReference} — Sika Threads`,
      type: 'order_request_ack',
      status: 'sent',
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
      idempotencyKey: `ack_${order.orderReference}`,
      htmlBody: this.generateEmailWrapper(bodyHtml),
      textBody: `Dear ${order.customer.name}, your order request ${order.orderReference} has been received. Proposed total: GHS ${order.proposedTotal}. We will contact you shortly.`,
    };

    this.recordJob(job);
    return job;
  }

  // 2. StyleMatch Submission Acknowledgement
  static sendStyleMatchAcknowledgement(request: StyleMatchRequest): EmailJob {
    const bodyHtml = `
      <h2 style="font-family: Georgia, serif; color: #20201D;">Your Sika StyleMatch Request is Being Processed</h2>
      <p>Dear ${request.customerName},</p>
      <p>Thank you for consulting <strong>Sika StyleMatch AI</strong> for your upcoming <strong>${request.occasion}</strong>.</p>
      <p>Our intelligent styling engine is currently cross-referencing your occasion, desired color palette (<em>${request.preferredColours.join(', ')}</em>), and budget range (GHS ${request.budgetRange.min} – ${request.budgetRange.max}) against our genuine warehouse catalogue.</p>
      <p><strong>Human Review in Progress:</strong> To maintain the highest standard of Ghanaian textile craftsmanship, every AI-matched recommendation is personally reviewed and verified by a master stylist before dispatch. Our target turnaround time is approximately <strong>3 to 5 minutes</strong>.</p>
      <p style="color: #70706B; font-size: 13px;">Request Reference: #${request.id}</p>
    `;

    const job: EmailJob = {
      id: 'em-' + Date.now(),
      referenceId: request.id,
      recipientEmail: request.customerEmail,
      recipientName: request.customerName,
      subject: `StyleMatch Request Received for ${request.occasion} — Sika Threads`,
      type: 'stylematch_ack',
      status: 'sent',
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
      idempotencyKey: `sm_ack_${request.id}`,
      htmlBody: this.generateEmailWrapper(bodyHtml),
      textBody: `Dear ${request.customerName}, we received your StyleMatch request for ${request.occasion}. Recommendations will be reviewed and sent shortly.`,
    };

    this.recordJob(job);
    return job;
  }

  // 3. Approved StyleMatch Recommendations to Customer
  static sendApprovedStyleMatchRecommendations(
    request: StyleMatchRequest,
    approvedProducts: Array<{
      name: string;
      fabricType: string;
      price: number;
      sellingUnit: string;
      imageUrl: string;
      reason: string;
      slug: string;
    }>
  ): EmailJob {
    const productsHtml = approvedProducts
      .map(
        (p) => `
      <div class="product-box">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="120" valign="top">
              <img src="${p.imageUrl}" alt="${p.name}" width="110" style="border-radius: 4px; display: block; max-height: 110px; object-fit: cover;" />
            </td>
            <td valign="top" style="padding-left: 14px;">
              <h4 style="margin: 0 0 6px 0; color: #20201D;">${p.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #70706B;">Fabric: <strong>${p.fabricType}</strong></p>
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #8B2635;">Price: GHS ${p.price.toLocaleString()} / ${p.sellingUnit}</p>
              <p style="margin: 0; font-size: 13px; color: #20201D; font-style: italic;">"${p.reason}"</p>
            </td>
          </tr>
        </table>
      </div>
    `
      )
      .join('');

    const bodyHtml = `
      <h2 style="font-family: Georgia, serif; color: #20201D;">Your Sika Threads Fabric Recommendations Are Ready</h2>
      <p>Dear ${request.customerName},</p>
      <p>Our senior styling team has verified and approved the following fabric selections from our genuine inventory for your <strong>${request.occasion}</strong>:</p>
      
      ${productsHtml}

      <div style="background-color: #FAF9F6; border-left: 4px solid #B8863B; padding: 14px; margin-top: 20px;">
        <p style="margin: 0; font-size: 13px;">
          <strong>Availability Note:</strong> All recommended fabrics are physically stocked at our Accra facility. Because quantities are limited, we advise submitting an order request promptly to secure your preferred yardage.
        </p>
      </div>

      <p style="margin-top: 24px; text-align: center;">
        <a href="http://localhost:5173/shop" class="button">Browse Catalogue &amp; Request Yards</a>
      </p>
    `;

    const job: EmailJob = {
      id: 'em-' + Date.now(),
      referenceId: request.id,
      recipientEmail: request.customerEmail,
      recipientName: request.customerName,
      subject: `Your Sika Threads fabric recommendations are ready — ${request.occasion}`,
      type: 'stylematch_approved_recommendations',
      status: 'sent',
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
      idempotencyKey: `sm_appr_${request.id}`,
      htmlBody: this.generateEmailWrapper(bodyHtml),
      textBody: `Dear ${request.customerName}, your Sika Threads fabric recommendations for ${request.occasion} have been reviewed and approved by our team.`,
    };

    this.recordJob(job);
    return job;
  }

  // 4. StyleMatch Delay Notification
  static sendStyleMatchDelayNotice(request: StyleMatchRequest): EmailJob {
    const bodyHtml = `
      <h2 style="font-family: Georgia, serif; color: #20201D;">Update on Your Sika StyleMatch Request</h2>
      <p>Dear ${request.customerName},</p>
      <p>We wanted to give you a transparent update regarding your fabric consultation for <strong>${request.occasion}</strong>.</p>
      <p>Our stylists are taking extra care in curating and inspecting our warehouse inventory to find the closest match to your requested palette and texture. We have exceeded our standard 3–5 minute target, but a bespoke recommendation will be delivered to your inbox shortly.</p>
      <p>Thank you for your patience and appreciation for authentic Ghanaian textiles.</p>
    `;

    const job: EmailJob = {
      id: 'em-' + Date.now(),
      referenceId: request.id,
      recipientEmail: request.customerEmail,
      recipientName: request.customerName,
      subject: `A quick update on your Sika Threads StyleMatch request`,
      type: 'stylematch_delay_notice',
      status: 'sent',
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
      idempotencyKey: `sm_delay_${request.id}`,
      htmlBody: this.generateEmailWrapper(bodyHtml),
      textBody: `Dear ${request.customerName}, our team is taking extra care with your StyleMatch request. Recommendations will arrive shortly.`,
    };

    this.recordJob(job);
    return job;
  }

  // 5. Order Status Update Notification
  static sendOrderStatusUpdate(order: OrderRequest, statusNote?: string): EmailJob {
    const statusTitles: Record<string, string> = {
      awaiting_stock_verification: 'Awaiting Stock Verification',
      awaiting_customer_confirmation: 'Awaiting Your Confirmation of Final Details',
      confirmed: 'Order Confirmed & Fulfilment Commencing',
      preparing_order: 'Preparing and Cutting Fabric',
      ready_for_pickup: 'Your Fabric is Ready for Collection',
      dispatched: 'Dispatched for Delivery',
      delivered: 'Order Delivered Successfully',
      cancelled: 'Order Request Cancelled',
      sourcing_required: 'Fabric Sourcing Required',
    };

    const title = statusTitles[order.status] || 'Order Status Update';

    const bodyHtml = `
      <h2 style="font-family: Georgia, serif; color: #20201D;">Order ${order.orderReference}: ${title}</h2>
      <p>Dear ${order.customer.name},</p>
      <p>Your order request <strong>${order.orderReference}</strong> has progressed to: <span class="badge">${title}</span></p>
      ${statusNote ? `<p style="background-color: #FAF9F6; padding: 12px; border-radius: 4px;"><strong>Details from Sika Threads:</strong> ${statusNote}</p>` : ''}
      ${order.finalAgreedPriceSnapshot ? `<p><strong>Confirmed Order Total:</strong> GHS ${order.finalAgreedPriceSnapshot.toLocaleString()}</p>` : ''}
      ${order.finalAgreedDeliveryTerms ? `<p><strong>Delivery / Pickup Terms:</strong> ${order.finalAgreedDeliveryTerms}</p>` : ''}
      <p style="margin-top: 20px;">If you have any questions or require modifications, please reply to this email or contact us on WhatsApp at <strong>+233 55 771 8472</strong>.</p>
    `;

    const job: EmailJob = {
      id: 'em-' + Date.now(),
      referenceId: order.orderReference,
      recipientEmail: order.customer.email,
      recipientName: order.customer.name,
      subject: `Order Update [${order.orderReference}]: ${title} — Sika Threads`,
      type: 'order_status_update',
      status: 'sent',
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
      idempotencyKey: `status_${order.orderReference}_${order.status}_${Date.now()}`,
      htmlBody: this.generateEmailWrapper(bodyHtml),
      textBody: `Dear ${order.customer.name}, your order ${order.orderReference} status has been updated to ${title}.`,
    };

    this.recordJob(job);
    return job;
  }

  // 6. Sourcing Request Acknowledgement
  static sendSourcingAcknowledgement(sourcing: SourcingRequest): EmailJob {
    const bodyHtml = `
      <h2 style="font-family: Georgia, serif; color: #20201D;">Fabric Sourcing Request Received: ${sourcing.reference}</h2>
      <p>Dear ${sourcing.customerName},</p>
      <p>We received your custom sourcing inquiry for <strong>${sourcing.desiredFabricType}</strong> (${sourcing.colourPattern}).</p>
      <p>Our dedicated fabric procurement team collaborates directly with master weavers in Bonwire, licensed GTP/Woodin distributors, and international lace merchants. We will research availability and formulate a clear proposal with estimated pricing and lead times.</p>
      <p>Reference: <strong>${sourcing.reference}</strong></p>
    `;

    const job: EmailJob = {
      id: 'em-' + Date.now(),
      referenceId: sourcing.reference,
      recipientEmail: sourcing.customerEmail,
      recipientName: sourcing.customerName,
      subject: `Fabric Sourcing Inquiry: ${sourcing.reference} — Sika Threads`,
      type: 'sourcing_ack',
      status: 'sent',
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sentAt: new Date().toISOString(),
      idempotencyKey: `src_ack_${sourcing.reference}`,
      htmlBody: this.generateEmailWrapper(bodyHtml),
      textBody: `Dear ${sourcing.customerName}, we received your fabric sourcing inquiry ${sourcing.reference}. Our procurement team will follow up shortly.`,
    };

    this.recordJob(job);
    return job;
  }
}
