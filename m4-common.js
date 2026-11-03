// Fonctions partagées par les 3 pages du Membre 4
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, LOGIN_PAGE } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Statuts d'une demande
export const STATUTS = {
  en_attente: { label: "En attente", cls: "st-wait", etape: 0 },
  acceptee:   { label: "Acceptée",   cls: "st-ok",   etape: 1 },
  en_cours:   { label: "En cours",   cls: "st-run",  etape: 2 },
  terminee:   { label: "Terminée",   cls: "st-done", etape: 3 },
  refusee:    { label: "Refusée",    cls: "st-no",   etape: -1 },
  annulee:    { label: "Annulée",    cls: "st-no",   etape: -1 }
};

export const CATEGORIES = ["Coiffure", "Plomberie", "Mécanique", "Maçonnerie"];

// Protège contre l'injection HTML (sécurité)
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const userName = (u) => u.displayName || (u.email ? u.email.split("@")[0] : "Utilisateur");
export const initiale = (n) => (n || "?").trim().charAt(0).toUpperCase();

const toDate = (ts) => ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
export const fmtDate = (ts) => {
  const d = toDate(ts);
  return d ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};
export const fmtHeure = (ts) => {
  const d = toDate(ts);
  return d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
};

// Attend l'utilisateur connecté, sinon renvoie vers la page de connexion (Membre 3)
export function requireAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (user) => {
      off();
      if (!user) {
        const retour = encodeURIComponent(location.pathname.split("/").pop() + location.search);
        location.href = `${LOGIN_PAGE}?redirect=${retour}`;
        return;
      }
      resolve(user);
    });
  });
}

// Écoute en temps réel les demandes où l'utilisateur est client OU prestataire.
// callback reçoit un tableau trié (plus récent d'abord) avec la propriété `role`.
export function watchMyRequests(uid, callback) {
  const map = new Map();
  const emit = () => {
    const list = [...map.values()].sort((a, b) =>
      (toDate(b.createdAt)?.getTime() ?? Date.now()) - (toDate(a.createdAt)?.getTime() ?? Date.now()));
    callback(list);
  };
  const listen = (champ, role) => onSnapshot(
    query(collection(db, "demandes"), where(champ, "==", uid)),
    (snap) => {
      snap.docChanges().forEach((ch) => {
        if (ch.type === "removed") map.delete(ch.doc.id);
        else map.set(ch.doc.id, { id: ch.doc.id, ...ch.doc.data(), role: map.get(ch.doc.id)?.role === "client" ? "client" : role });
      });
      emit();
    },
    (err) => console.error("Firestore :", err)
  );
  const u1 = listen("clientId", "client");
  const u2 = listen("prestataireId", "pro");
  return () => { u1(); u2(); };
}

export function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

// Barre du haut + navigation du bas
export function renderNav(actif, user) {
  document.getElementById("topbar").innerHTML =
    `<h1>DevMind Services +</h1><span class="who">${esc(userName(user))}</span>`;
  const onglets = [
    ["demande.html", "➕", "Demander", "demande"],
    ["suivi.html", "📋", "Suivi", "suivi"],
    ["messagerie.html", "💬", "Messages", "messagerie"]
  ];
  document.getElementById("tabbar").innerHTML = onglets.map(([href, ico, txt, id]) =>
    `<a href="${href}" class="${id === actif ? "actif" : ""}"><span>${ico}</span>${txt}</a>`).join("");
}
