<template>
  <v-app-bar class="nav" :elevation="0">
    <v-container class="nav-inner" fluid>
      
      <div class="left">
        <router-link to="/" class="logo-wrap">
          <v-img :src="logo" class="logo" contain height="44" width="96" />
        </router-link>
      </div>

     
      <div class="right">
        <template v-if="loggedIn && userName">
          <div class="pill greeting-pill">
           Buna&nbsp;<strong>{{ userName }}</strong>
          </div>
        </template>

        <router-link class="pill link-pill" to="/">
          Acasă
        </router-link>

        <router-link
          v-if="loggedIn && role === 'admin'"
          class="pill link-pill"
          to="/admin-studies"
        >
          Demarează studii
        </router-link>

        <router-link
          v-if="loggedIn && role === 'pacient'"
          class="pill link-pill"
          to="/participa"
        >
          Detalii Pacient
        </router-link>

        <template v-if="!loggedIn">
          <router-link class="pill link-pill" to="/register">
            Înregistrare
          </router-link>

          <router-link class="pill link-pill primary-pill" to="/login">
            Login
          </router-link>
        </template>

        <template v-else>
          <button class="pill link-pill logout-pill" @click="logout">
            Logout
          </button>
        </template>
      </div>
    </v-container>
  </v-app-bar>
</template>


<style scoped>

.nav {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.78));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(30, 41, 59, 0.08);
}


.nav::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("@/assets/Banner.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.10; 
  pointer-events: none;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
}


.logo-wrap {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
.logo {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.08));
}


.right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}


.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 15px;
  line-height: 1;
  text-decoration: none;
  border: 1px solid rgba(30, 41, 59, 0.10);
  background: rgba(255, 255, 255, 0.75);
  color: #111827;
  transition: transform 120ms ease, filter 120ms ease, background 120ms ease;
}

.link-pill:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}


.greeting-pill {
  border: 1px solid rgba(101, 91, 129, 0.22);
  background: rgba(101, 91, 129, 0.10);
}


.primary-pill {
  background: #655b81;
  color: white;
  border: 1px solid rgba(101, 91, 129, 0.65);
  font-weight: 800;
}
.primary-pill:hover {
  filter: brightness(0.95);
}


.logout-pill {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.75);
}


.router-link-active.link-pill {
  border-color: rgba(101, 91, 129, 0.45);
  background: rgba(101, 91, 129, 0.12);
}
</style>


<script>
import logo from "@/assets/sanofi_logo.png";

export default {
  name: "Navigation",

  data() {
    return {
      logo,
      refreshKey: 0, 
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
      this.refreshKey;
      return localStorage.getItem("token");
    },

    loggedIn() {
      return !!this.token;
    },

    userName() {
      if (!this.token) return "";

      try {
        const payloadPart = this.token.split(".")[1];
        if (!payloadPart) return "";

        // base64url -> base64
        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
        const payload = JSON.parse(atob(padded));

        return payload.name || "";
      } catch (e) {
        return "";
      }
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
    }

  },

  methods: {
    bumpRefresh() {
      this.refreshKey++;
    },

    logout() {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));
      this.$router.push("/");

      setTimeout(() => {
        window.location.reload();
      }, 80);
    }
  }
};
</script>


