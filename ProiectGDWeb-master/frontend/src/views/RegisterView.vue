<template>
  <div class="container">
    <v-card class="card" max-width="344">
<v-form v-model="form" @submit.prevent="onSubmit">

<v-text-field
  v-model="name"
  :readonly="loading"
  :rules="[required]"
  label="Name"
  clearable
/>

  <v-text-field
    v-model="email"
    :readonly="loading"
    :rules="[required, validEmail]"
    label="Email"
    class="mb-2"
    clearable
  />

  <v-text-field
    v-model="password"
    :readonly="loading"
    :rules="[required, min8]"
    label="Parola"
    type="password"
    class="mb-2"
    clearable
  />

  <v-btn
    :disabled="!form"
    :loading="loading"
    color="success"
    type="submit"
    block
  >
    Register
  </v-btn>
</v-form>

    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">
  {{ errorMessage }}
</v-alert>

<v-alert v-if="successMessage" type="success" variant="tonal" class="mb-3">
  {{ successMessage }}
</v-alert>

</div>

<p class="copyright">© Anofi 2004-2025 - All rights reserved</p>
</template>

<script>
export default {
  name: "RegisterView",

  data: () => ({
    form: false,
    name: "",
    email: "",
    password: "",
    loading: false,
    errorMessage: "",
    successMessage: ""
  }),

  methods: {
    required(v) {
      return !!v || "Field is required";
    },
    validEmail(v) {
      return /.+@.+\..+/.test(v || "") || "Invalid email";
    },
    min8(v) {
      return (v && v.length >= 8) || "Password must be at least 8 characters";
    },

    async onSubmit() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.form) return;

      this.loading = true;
      try {
        const res = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          })
        });

        // Try to parse JSON either way
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : await res.text();

        if (!res.ok) {
          // Express-validator format: { errors: [ { msg, ... } ] }
          if (data && data.errors && Array.isArray(data.errors)) {
            throw new Error(data.errors.map(e => e.msg).join(", "));
          }
          // Or your custom: { error: "..." }
          throw new Error((data && data.error) || (data && data.message) || "Register failed");
        }

       
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.dispatchEvent(new Event("auth-changed")); // 
        }

        // optional: show message briefly (you can delete this if you want)
        this.successMessage = `Account created for ${data.email || this.email}`;

        // clear fields
        this.name = "";
        this.email = "";
        this.password = "";


        // go home
        this.$router.push("/");


        setTimeout(() => {
          this.$router.push("/");
        }, 200);

      } catch (err) {
        this.errorMessage = err.message || "Register failed";
      } finally {
        this.loading = false;
      }
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
