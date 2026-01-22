<template>
  <div class="container">
    <v-card class="card" max-width="344">
      <v-form class="form" v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          :readonly="loading"
          :rules="[required]"
          class="mb-2"
          label="Email"
          clearable></v-text-field>

        <v-text-field
          v-model="password"
          :readonly="loading"
          :rules="[required]"
          label="Parola"
          placeholder="Enter your password"
          clearable></v-text-field>

        <br />

        <v-btn
          :disabled="!form"
          :loading="loading"
          color="success"
          size="large"
          type="submit"
          variant="elevated"
          block>
          Logare
        </v-btn>
      </v-form>
    </v-card>
</div>

<p class="copyright">© Anofi 2004-2025 - All rights reserved</p>
</template>

<script>
export default {
  name: "RegisterView",
  data: () => ({
    form: false,
    email: null,
    password: null,
    loading: false
  }),

  methods: {
    async onSubmit() {
      if (!this.form) return;

      const data = {
        email: this.email,
        password: this.password
        };

         
      
      /*const baseUrl = "http://localhost:3000";

      if (!this.form) return;

      const data = {
        email: this.email,
        password: this.password
      };

      this.loading = true;

      await fetch(baseUrl + "/users", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data)
      });

      this.loading = false;
      */
    },
    
    required(v) {
      return !!v || "Field is required";
    }
  }
};
</script>

<style scoped>
.form{
  display: flex;
  flex-direction: column; 
  width: 100%;
}

.card{
  padding: 20px; 
  width: 500px;
  max-width: 100%; 
  height: 250px;
  max-height: 100%;
}

.container{
  display: grid;
  justify-content: center; 
  align-items: center;  
  height: 80vh;
  width: 100vw;
  background-color: #ece4f7;
}

.copyright{
  padding-top: 40px;
  text-align: center;
}
</style>
