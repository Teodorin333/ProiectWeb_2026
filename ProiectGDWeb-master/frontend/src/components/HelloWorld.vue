<template>
  <div class="page">
    <!-- HERO -->
    <section class="hero">
      <v-container class="hero-container">
        <v-row align="center" class="py-10 py-md-14">
          <v-col cols="12" md="7">
            <div class="kicker">Safe & Private</div>

            <h1 class="hero-title">
              Platformă clinică modernă<br />
              pentru studii sigure
            </h1>

            <p class="hero-subtitle">
              Gestionare studii, înscriere participanți și fluxuri controlate pentru pacienți, medici și administratori.
            </p>

            <!-- role-based primary action -->
            <div class="d-flex flex-wrap ga-3 mt-6">
              <v-btn
                v-if="!isLoggedIn"
                class="btn-primary"
                size="large"
                to="/login"
              >
                Autentificare
              </v-btn>

              <v-btn
                v-else-if="isPacient"
                class="btn-primary"
                size="large"
                to="/studii"
              >
                Vezi studiile
              </v-btn>

              <v-btn
                v-else-if="isDoctor"
                class="btn-primary"
                size="large"
                to="/studii-derulare"
              >
                Vezi studiile
              </v-btn>

              <v-btn
                v-else-if="isAdmin"
                class="btn-primary"
                size="large"
                to="/admin-studies"
              >
                Panou Admin
              </v-btn>


            </div>
          </v-col>

          <v-col cols="12" md="5" class="d-flex justify-center">
            <!-- Use your carousel images as a "soft" hero visual -->
            <div class="hero-visual">
              <v-carousel
              height="280"
              hide-delimiters
              show-arrows="hover"
              cycle
            >
              <v-carousel-item>
                <v-img
                  src="@/assets/Pic1.png"
                  height="280"
                  contain
                />
              </v-carousel-item>

              <v-carousel-item>
                <v-img
                  src="@/assets/Promo2.jpg"
                  height="280"
                  contain
                />
              </v-carousel-item>

              <v-carousel-item>
                <v-img
                  src="@/assets/Promo3.jpg"
                  height="280"
                  contain
                />
              </v-carousel-item>
            </v-carousel>


            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CONTENT -->
    <section class="section">
      <v-container class="content-container">
        <!-- Mission card -->
        <v-card class="card-soft mb-6" elevation="0">
          <div class="card-title">Misiunea noastră - Un mediu sigur</div>
          <div class="card-text">
            Pentru noi, sănătatea nu este doar un scop, ci un angajament. Suntem în continuă căutare de metode noi și sigure
            pentru a inova domeniul studiului de cercetare farmaceutic. Astfel, tratamentele dezvoltate de noi sunt de cea mai
            înaltă calitate.
          </div>
        </v-card>

        <!-- Role cards grid -->
        <v-row dense>
          <!-- pacient -->
          <v-col cols="12" md="4" v-if="isPacient">
            <v-card class="card-soft" elevation="0">
              <div class="card-title">Studii Valabile</div>
              <div class="card-text">Descoperă studiile clinice disponibile și înscrie-te rapid.</div>
              <v-card-actions class="pt-4">
                <v-btn class="btn-primary" to="/studii">Descoperă Studiile</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- doctor -->
          <v-col cols="12" md="4" v-if="isDoctor">
            <v-card class="card-soft" elevation="0">
              <div class="card-title">Studii în derulare</div>
              <div class="card-text">Vezi toate studiile active și gestionează informațiile aferente.</div>
              <v-card-actions class="pt-4">
                <v-btn class="btn-primary" to="/studii-derulare">Vezi studiile</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- admin -->
          <v-col cols="12" md="4" v-if="isAdmin">
            <v-card class="card-soft" elevation="0">
              <div class="card-title">Demarează studii</div>
              <div class="card-text">
                Pornește un studiu clinic. După pornire, medicii nu îl mai pot modifica.
              </div>
              <v-card-actions class="pt-4">
                <v-btn class="btn-primary" to="/admin-studies">Demarează</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- not logged in -->
          <v-col cols="12" md="4" v-else-if="!isLoggedIn">
            <v-card class="card-soft" elevation="0">
              <div class="card-title">Programul Safe & Private</div>
              <div class="card-text">Autentifică-te pentru a accesa funcționalitățile platformei.</div>
              <v-card-actions class="pt-4">
                <v-btn class="btn-primary" to="/login">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <div class="footer-note">© Anofi 2004-2025 - All rights reserved</div>
      </v-container>
    </section>
  </div>
</template>


<style scoped>

.v-img {
  background-color: #b9a6c9;
}

.page {
  background: #ffffff;
}

/* HERO (light) */
.hero {
  background: radial-gradient(900px circle at 20% 10%, rgba(101, 91, 129, 0.12), transparent 60%),
              linear-gradient(180deg, #ffffff, #f6f7fb);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.hero-container {
  max-width: 1200px;
}

.kicker {
  display: inline-block;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #655b81;
  background: rgba(101, 91, 129, 0.10);
  padding: 8px 12px;
  border-radius: 999px;
}

.hero-title {
  margin-top: 14px;
  font-size: 52px;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #111827;
}

.hero-subtitle {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.7;
  color: #4b5563;
  max-width: 620px;
}

/* Hero visual */
.hero-visual {
  width: 100%;
  max-width: 460px;
  border-radius: 18px;
  overflow: hidden;
  background: #bfbcbc;
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(17, 24, 39, 0.08);
}

/* CONTENT SECTION */
.section {
  background: #f6f7fb;
  padding: 28px 0 48px 0;
}

.content-container {
  max-width: 1200px;
}

/* Cards */
.card-soft {
  padding: 22px 22px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 12px 30px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 10px;
}

.card-text {
  font-size: 15px;
  line-height: 1.7;
  color: #4b5563;
}

/* Buttons */
.btn-primary {
  background: #655b81;
  color: white;
  font-weight: 800;
  border-radius: 12px;
}

.btn-primary:hover {
  filter: brightness(0.95);
}

.btn-outline {
  border-radius: 12px;
  font-weight: 800;
}

/* Footer */
.footer-note {
  text-align: center;
  margin-top: 26px;
  color: #6b7280;
  font-size: 13px;
}

</style>

<script>
export default {
  name: "HelloWorld",

  data() {
    return {
      refreshKey: 0
    };
  },

  mounted() {
    window.addEventListener("storage", this.bumpRefresh);
    window.addEventListener("auth-changed", this.bumpRefresh);
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.bumpRefresh);
    window.removeEventListener("auth-changed", this.bumpRefresh);
  },

  computed: {
    token() {
      this.refreshKey; // force recompute
      return localStorage.getItem("token");
    },

    isLoggedIn() {
  return !!this.token;
},

loginRedirect() {
  return this.isLoggedIn ? "/participa" : "/login";
},

    role() {
      if (!this.token) return "";
      try {
        const payloadPart = this.token.split(".")[1];
        if (!payloadPart) return "";

        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
        const payload = JSON.parse(atob(padded));

        return payload.role || "";
      } catch (e) {
        return "";
      }
    },

    isPacient() {
      return this.role === "pacient";
    },

    isDoctor() {
  return this.role === "doctor";
  },

  isAdmin() {
  return this.role === "admin";
},


  },

  methods: {
    bumpRefresh() {
      this.refreshKey++;
    }
  }
};
</script>

