import { redirect } from "next/navigation";

/**
 * Backward-compat: /profile è stato spostato a /locale (informazioni ristorante)
 * mentre "Profilo" nel tab bar punta ora a /account (profilo utente).
 */
export default function ProfileRedirect() {
  redirect("/locale");
}
