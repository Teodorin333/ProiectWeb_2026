import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RegisterView from "../views/RegisterView.vue";
import StudiesView from "@/views/StudiesView.vue";


const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  
  {
  path: "/login",
  name: "Login",
  component: () => import("../views/LogInView.vue")
},
  {
    path: "/register",
    name: "register",
    component: RegisterView
  },
  {
  path: "/participa",
  name: "Participa",
  component: () => import("../views/ParticipaView.vue")
},
{
  path: "/studii",
  name: "Studii",
  component: StudiesView
},
{
  path: "/studii-derulare",
  name: "studii-derulare",
  component: () => import("../views/DoctorView.vue"),
  meta: { requiresDoctor: true }
},

{
  path: "/studii-derulare/:studyId",
  name: "studii-derulare-detalii",
  component: () => import("../views/DoctorStudyView.vue"),
  meta: { requiresDoctor: true }
},

{
  path: "/admin-studies",
  name: "AdminStudies",
  component: () => import("../views/AdminStudyView.vue"),
  meta: { requiresAdmin: true }
},




];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(){
    return {top: 0};
  }
});

function getPayload(token) {
  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const payload = token ? getPayload(token) : null;
  const role = payload?.role || "";

  // pacient-only pages
  if (to.path === "/participa") {
    if (!token) return next("/login");
    if (role !== "pacient") return next("/");
    return next();
  }

  // doctor-only pages
  // doctor-only pages
if (to.path.startsWith("/studii-derulare")) {
  if (!token) return next("/login");
  if (role !== "doctor") return next("/");
  return next();
}

// admin-only pages
if (to.path === "/admin-studies") {
  if (!token) return next("/login");
  if (role !== "admin") return next("/");
  return next();
}



  // OPTIONAL (recommended): studies list is for pacients only
  // If you want doctors to NOT access /studii, keep this block.
  if (to.path === "/studii") {
    if (!token) return next("/login");
    if (role !== "pacient") return next("/");
    return next();
  }

  next();
});



export default router;
