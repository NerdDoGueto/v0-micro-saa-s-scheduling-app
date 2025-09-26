// app/api/bookings/cancel/[token]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // importe/crie client dentro do handler (evita side effects no build)
  let createClientFn: typeof import("@/lib/supabase/server").createClient;
  try {
    ({ createClient: createClientFn } = await import("@/lib/supabase/server"));
  } catch (err) {
    console.error("Import supabase server failed:", err);
    return NextResponse.json({ error: "Server initialization error" }, { status: 500 });
  }

  let supabase;
  try {
    supabase = await createClientFn();
  } catch (err) {
    console.error("Failed to create supabase client:", err);
    return NextResponse.json({ error: "Database client init failed" }, { status: 500 });
  }

  try {
    const { data, error: findError } = await supabase
      .from("bookings")
      .select(`
        *,
        calendars (
          id,
          title,
          user_id,
          profiles (
            id,
            full_name,
            email,
            username
          )
        )
      `)
      .eq("cancellation_token", token)
      .single();

    if (findError || !data) {
      console.warn("Booking not found:", { token, findError });
      return NextResponse.json({ error: "Booking not found or invalid token" }, { status: 404 });
    }

    const booking = data as any;
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const { error: cancelError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("cancellation_token", token);

    if (cancelError) {
      console.error("Cancel update failed:", cancelError);
      throw cancelError;
    }

    // normalize relations (Supabase pode devolver arrays dependendo do schema)
    const calendar = booking.calendars && !Array.isArray(booking.calendars)
      ? booking.calendars
      : Array.isArray(booking.calendars) ? booking.calendars[0] : null;
    const profile = calendar?.profiles && !Array.isArray(calendar.profiles)
      ? calendar.profiles
      : Array.isArray(calendar?.profiles) ? calendar.profiles[0] : null;

    // import do email só quando necessário
    try {
      const { sendCancellationConfirmation } = await import("@/lib/email");
      await sendCancellationConfirmation({
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        calendarTitle: calendar?.title ?? null,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        hostName: profile?.full_name ?? profile?.username ?? null,
        hostEmail: profile?.email ?? null,
      });
    } catch (emailErr) {
      console.error("Email send failed (non-blocking):", emailErr);
    }

    return NextResponse.json({
      success: true,
      booking: {
        guest_name: booking.guest_name,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        calendar_title: calendar?.title ?? null,
      },
    });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}