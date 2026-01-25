<template>
  <div class="app">

  <v-col>
    <v-carousel class="slide">
  <v-carousel-item
    :src="require('@/assets/Pic1.png')"
    cover
    class="Promo1"
  ></v-carousel-item>

  <v-carousel-item
    :src="require('@/assets/Promo2.jpg')"
    cover
  ></v-carousel-item>

  <v-carousel-item
     :src="require('@/assets/Promo3.jpg')"
    cover
  ></v-carousel-item>
</v-carousel>
  </v-col>


  <v-col class="exposure">
    <v-card class="Expo" title="Misiunea noastra - Un mediu sigur" text="Pentru noi, sanatatea nu este doar un scop, ci un angajament. Suntem in continua cautare de metode noi si sigure pentru a inova domeniul studiului de cercetare farmaceutic. Astfel, tratamentele dezvoltate de noi sunt de cea mai inalta calitate."></v-card>

    <v-card
    v-if="isPacient"
    class="Expo"
    title="Studii Valabile"
    text="Descoperă studiile clinice disponibile și înscrie-te rapid."
  >
    <v-card-actions>
      <v-btn to="/studii">Descoperă Studiile</v-btn>
    </v-card-actions>
  </v-card>


    <!-- Doctor only -->
<v-card
  v-if="isDoctor"
  class="Expo"
  title="Studii în derulare"
  text="Vezi toate studiile active și gestionează informațiile aferente."
>
  <v-card-actions>
    <v-btn to="/studii-derulare">Vezi studiile</v-btn>
  </v-card-actions>
</v-card>

<!-- Admin only -->
<v-card
  v-if="isAdmin"
  class="Expo"
  title="Demarează studii"
  text="Pornește un studiu clinic. După pornire, medicii nu îl mai pot modifica."
>
  <v-card-actions>
    <v-btn to="/admin-studies">Demarează</v-btn>
  </v-card-actions>
</v-card>


<!-- Not logged in (optional card to guide users) -->
<v-card
  v-else-if="!isLoggedIn"
  class="Expo"
  title="Programul Safe & Private"
  text="Autentifică-te pentru a accesa funcționalitățile platformei."
>
  <v-card-actions>
    <v-btn to="/login">Login</v-btn>
  </v-card-actions>
</v-card>



  </v-col>

  <p class="copyright">© Anofi 2004-2025 - All rights reserved</p>
    
</div>
</template>

<style scoped>
.v-app-bar {
  font-family:Arial, Helvetica, sans-serif;
  color: black; 
  font-weight: bold;
  text-decoration-style: none;
  /*background-color:#b0abcf;*/
  background-image: url(@/assets/Banner.png);
  background-repeat: no-repeat;
  }


.Promo1{
  display: flex;
  justify-content: center; 
  align-items: center;
}

.Mission{
  background-color: #f5f0fc;
}

.app{
  background-image:  url('@/assets/BG.png');
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat; 
  height: 135vh; 
  width: 100vw; 
  margin: 0; 
}

.Expo{
  margin-bottom: 15px;
  background-color: #f5f0fc;
}

.copyright{
  text-align: center;
}

/*
.slide{
  display: flex;
  justify-content: center; 
  align-items: center;
}
  */
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

