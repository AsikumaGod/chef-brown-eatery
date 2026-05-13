// supabase/functions/send-order-email/index.ts
// Deploy: supabase functions deploy send-order-email
// Env vars needed in Supabase dashboard:
//   RESEND_API_KEY  — from resend.com
//   CHEF_EMAIL      — Chef Brown's email address (where orders arrive)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const {
      orderNumber,
      customerName,
      customerPhone,
      deliveryLocation,
      deliveryMethod,
      items,       // [{ name, qty, unitPrice, subtotal }]
      total,
      notes,
      orderedAt,
    } = await req.json();

    // ── Validate required fields ─────────────────────────────────────
    if (!orderNumber || !customerName || !customerPhone || !deliveryLocation || !items?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required order fields." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const CHEF_EMAIL     = Deno.env.get("CHEF_EMAIL");

    if (!RESEND_API_KEY || !CHEF_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing env vars." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── Build item rows for the HTML email ───────────────────────────
    const itemRows = items
      .map(
        (item: { name: string; qty: number; unitPrice: number; subtotal: number }) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #3a1a08;color:#f0ddb8;">${item.name}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #3a1a08;color:#f0ddb8;text-align:center;">${item.qty}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #3a1a08;color:#f0ddb8;text-align:right;">GHS ${item.unitPrice}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #3a1a08;color:#e8b535;font-weight:700;text-align:right;">GHS ${item.subtotal}</td>
        </tr>`
      )
      .join("");

    // ── Beautiful HTML email ─────────────────────────────────────────
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Order — Chef Brown</title>
</head>
<body style="margin:0;padding:0;background:#120801;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#120801;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1e0e04;border-radius:16px;overflow:hidden;border:1px solid rgba(201,147,10,0.25);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2c1407,#3a1a08);padding:32px 28px;text-align:center;border-bottom:2px solid #c9930a;">
            <div style="font-size:2.6rem;margin-bottom:8px;">👨‍🍳</div>
            <h1 style="margin:0;color:#e8b535;font-size:1.6rem;letter-spacing:.04em;">Chef Brown</h1>
            <p style="margin:4px 0 0;color:#8a6030;font-size:.82rem;letter-spacing:.08em;text-transform:uppercase;">Taste &amp; Tell Eatery</p>
          </td>
        </tr>

        <!-- Alert bar -->
        <tr>
          <td style="background:#c9930a;padding:12px 28px;text-align:center;">
            <p style="margin:0;color:#1a0900;font-weight:700;font-size:1rem;letter-spacing:.06em;text-transform:uppercase;">
              🔔 New Order Received!
            </p>
          </td>
        </tr>

        <!-- Order number badge -->
        <tr>
          <td style="padding:20px 28px 0;text-align:center;">
            <div style="display:inline-block;background:#2c1407;border:2px solid #c9930a;border-radius:12px;padding:12px 28px;">
              <p style="margin:0 0 3px;color:#8a6030;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;font-weight:700;">Order Number</p>
              <p style="margin:0;color:#e8b535;font-size:1.6rem;font-weight:900;letter-spacing:.08em;font-family:'Courier New',monospace;">${orderNumber}</p>
            </div>
          </td>
        </tr>

        <!-- Customer info -->
        <tr>
          <td style="padding:24px 28px 0;">
            <h2 style="margin:0 0 16px;color:#e8b535;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;">
              Customer Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,147,10,.15);color:#8a6030;font-size:.82rem;width:40%;">👤 Name</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,147,10,.15);color:#f0ddb8;font-size:.88rem;font-weight:600;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,147,10,.15);color:#8a6030;font-size:.82rem;">📞 Phone</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,147,10,.15);color:#f0ddb8;font-size:.88rem;font-weight:600;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,147,10,.15);color:#8a6030;font-size:.82rem;">📍 Location</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(201,147,10,.15);color:#f0ddb8;font-size:.88rem;font-weight:600;">${deliveryLocation}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#8a6030;font-size:.82rem;">🚗 Method</td>
                <td style="padding:8px 0;color:#f0ddb8;font-size:.88rem;font-weight:600;">${deliveryMethod}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Order items -->
        <tr>
          <td style="padding:24px 28px 0;">
            <h2 style="margin:0 0 14px;color:#e8b535;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;">
              Order Items
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid rgba(201,147,10,.2);">
              <thead>
                <tr style="background:#2c1407;">
                  <th style="padding:10px 14px;text-align:left;color:#c9930a;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;">Meal</th>
                  <th style="padding:10px 14px;text-align:center;color:#c9930a;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 14px;text-align:right;color:#c9930a;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;">Unit</th>
                  <th style="padding:10px 14px;text-align:right;color:#c9930a;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;">Sub</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Total -->
        <tr>
          <td style="padding:18px 28px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,147,10,.1);border-radius:10px;border:1px solid rgba(201,147,10,.3);">
              <tr>
                <td style="padding:14px 18px;">
                  <span style="color:#8a6030;font-size:.85rem;text-transform:uppercase;letter-spacing:.1em;font-weight:700;">Total Amount</span>
                </td>
                <td style="padding:14px 18px;text-align:right;">
                  <span style="color:#e8b535;font-size:1.5rem;font-weight:800;">GHS ${total}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Notes -->
        ${notes ? `
        <tr>
          <td style="padding:18px 28px 0;">
            <div style="background:#2c1407;border-radius:10px;padding:14px 16px;border-left:3px solid #c9930a;">
              <p style="margin:0 0 5px;color:#c9930a;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;">Special Instructions</p>
              <p style="margin:0;color:#f0ddb8;font-size:.88rem;line-height:1.6;">${notes}</p>
            </div>
          </td>
        </tr>` : ""}

        <!-- Timestamp -->
        <tr>
          <td style="padding:20px 28px 28px;">
            <p style="margin:0;color:rgba(138,96,48,.5);font-size:.74rem;text-align:right;">
              🕐 Ordered at ${orderedAt}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#2c1407;padding:18px 28px;text-align:center;border-top:1px solid rgba(201,147,10,.2);">
            <p style="margin:0;color:rgba(138,96,48,.6);font-size:.74rem;">
              Chef Brown Taste &amp; Tell Eatery · Watico Campus Gate, Kesstown
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

    // ── Plain text fallback ──────────────────────────────────────────
    const text = [
      "NEW ORDER — Chef Brown Taste & Tell Eatery",
      "==========================================",
      `Order No : ${orderNumber}`,
      `Customer : ${customerName}`,
      `Phone    : ${customerPhone}`,
      `Location : ${deliveryLocation}`,
      `Method   : ${deliveryMethod}`,
      "",
      "ITEMS:",
      ...items.map((i: { name: string; qty: number; subtotal: number }) =>
        `  • ${i.name} × ${i.qty}  →  GHS ${i.subtotal}`
      ),
      "------------------------------",
      `TOTAL    : GHS ${total}`,
      "",
      `Notes    : ${notes || "None"}`,
      `Time     : ${orderedAt}`,
    ].join("\n");

    // ── Send via Resend ──────────────────────────────────────────────
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chef Brown Orders <orders@yourdomain.com>", // ← change to your verified domain
        to: [CHEF_EMAIL],
        subject: `🔔 Order ${orderNumber} — ${customerName} — GHS ${total}`,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to send email.", detail: err }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const resendData = await resendRes.json();

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
