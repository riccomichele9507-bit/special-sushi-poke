import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/account");

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif-jp text-ink">Il mio account</h1>
        <p className="text-sm text-warm-gray">{user.email}</p>
      </div>

      <AccountForm
        defaultName={customer?.name ?? ""}
        defaultPhone={customer?.phone ?? ""}
        defaultMarketingConsent={customer?.marketing_consent ?? false}
      />

      <div className="pt-8 border-t border-bamboo/20">
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="w-full sm:w-auto border-sushi-red/40 text-sushi-red hover:bg-sushi-red/10"
          >
            Esci
          </Button>
        </form>
      </div>
    </div>
  );
}
