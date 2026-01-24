<template>
  <v-container class="py-10" style="max-width: 520px;">
    <v-card class="pa-6" elevation="2">
      <v-card-title class="text-h5">Login</v-card-title>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">
        {{ errorMessage }}
      </v-alert>

      <v-form v-model="form" @submit.prevent="onSubmit">
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
          :rules="[required]"
          label="Parola"
          type="password"
          class="mb-2"
          clearable
        />

        <v-btn
          :disabled="!form"
          :loading="loading"
          color="primary"
          type="submit"
          block
        >
          Login
        </v-btn>
      </v-form>

      <div class="mt-4">
        <small>Don’t have an account?</small>
        <router-link to="/register" style="text-decoration:none; margin-left:6px;">
          Register
        </router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "LoginView",

  data: () => ({
    form: false,
    email: "",
    password: "",
    loading: false,
    errorMessage: ""
  }),

  methods: {
    required(v) {
      return !!v || "Field is required";
    },
    validEmail(v) {
      return /.+@.+\..+/.test(v || "") || "Invalid email";
    },

    async onSubmit() {
      this.errorMessage = "";
      if (!this.form) return;

      this.loading = true;
      try {
        const res = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : await res.text();

        if (!res.ok) {
          // Your backend might send { error: "..."} or { errors: [...] }
          if (data && data.errors && Array.isArray(data.errors)) {
            throw new Error(data.errors.map(e => e.msg).join(", "));
          }
          throw new Error((data && data.error) || (data && data.message) || "Login failed");
        }

        // Expecting something like: { token: "..." }
        if (!data.token) throw new Error("No token returned from server.");

        // Save token so you can use it later for protected endpoints
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("auth-changed"));


        // Redirect to home
        this.$router.push("/");
      } catch (err) {
        this.errorMessage = err.message || "Login failed";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
