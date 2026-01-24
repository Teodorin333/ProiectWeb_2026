<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
    
    </template>

    <v-app-bar-title>
      <v-img
          :src="logo"
          class="logo"
          contain
          height = "50"
          width = "100"
        />
    </v-app-bar-title>
    
    <span v-if="loggedIn && userName" class="link greeting">Bună {{ userName }}</span> |



      <router-link class="link" to="/">Acasa</router-link> |
      <router-link class="link" to="/cariere">Cariere</router-link> |

      <!-- NOT logged in -->
      <template v-if="!loggedIn">
        <router-link class="link" to="/register">Inregistrare</router-link> |
        <router-link class="link" to="/login">Login</router-link>
      </template>

      <!-- Logged in -->
      <template v-else>
        <span class="link logout" @click="logout">Logout</span>
      </template>



  </v-app-bar>



</template>

<style scoped>
.v-app-bar {
  font-family:Arial, Helvetica, sans-serif;
  color: black; 
  font-weight: bold;
  text-decoration-style: none;
  background-image: url(@/assets/Banner.png);
  background-repeat: no-repeat;
  }

.link{
  margin: 10px;
  font-size: 20px;
}

.logout {
  cursor: pointer;
}

.logout:hover {
  text-decoration: underline;
}
.greeting {
  font-weight: bold;
}


</style>

<script>
import logo from "@/assets/sanofi_logo.png";

export default {
  name: "Navigation",

  data() {
    return {
      logo,
      refreshKey: 0, // used only to force re-render when auth changes
    };
  },

  mounted() {
    // Forces computed props to re-evaluate when auth changes
    window.addEventListener("storage", this.bumpRefresh);
    window.addEventListener("auth-changed", this.bumpRefresh);
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.bumpRefresh);
    window.removeEventListener("auth-changed", this.bumpRefresh);
  },

  computed: {
    // depends on refreshKey so it re-checks after events
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


