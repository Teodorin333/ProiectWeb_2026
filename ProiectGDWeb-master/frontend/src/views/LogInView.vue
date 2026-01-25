<template>
  <div class="login-page">
    <v-container class="py-12" style="max-width: 520px;">
      <v-card class="login-card" elevation="8">
        <!-- Header -->
        <div class="login-header">
          <div class="text-h5 font-weight-bold">Autentificare</div>
          <div class="text-body-2 login-subtitle">
            Introdu datele contului pentru a continua.
          </div>
        </div>

        <v-divider />

        <v-card-text class="pt-6">
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <v-form v-model="form" @submit.prevent="onSubmit">
            <v-text-field
              v-model="email"
              :readonly="loading"
              :rules="[required, validEmail]"
              label="Email"
              variant="outlined"
              density="comfortable"
              clearable
              prepend-inner-icon="mdi-email-outline"
              class="mb-3"
            />

            <v-text-field
              v-model="password"
              :readonly="loading"
              :rules="[required]"
              label="Parolă"
              type="password"
              variant="outlined"
              density="comfortable"
              clearable
              prepend-inner-icon="mdi-lock-outline"
              class="mb-2"
            />

            <v-btn
              :disabled="!form"
              :loading="loading"
              class="login-btn mt-4"
              type="submit"
              block
              size="large"
            >
              Login
            </v-btn>

            <div class="mt-5 text-body-2 register-row">
              <span>Nu ai cont?</span>
              <router-link to="/register" class="register-link">
                Înregistrare
              </router-link>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
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

<style scoped>
/* full-page soft background like the CRO vibe */
.login-page {
  min-height: calc(100vh - 64px); /* subtract app-bar height if needed */
  display: flex;
  align-items: center;
  background:
    radial-gradient(900px 500px at 20% 10%, rgba(101, 91, 129, 0.18), transparent 60%),
    radial-gradient(700px 400px at 80% 20%, rgba(30, 136, 229, 0.14), transparent 55%),
    #f6f7fb;
}

/* modern card */
.login-card {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(30, 41, 59, 0.08);
}

/* top header area */
.login-header {
  padding: 22px 24px 16px 24px;
  background: linear-gradient(180deg, rgba(101, 91, 129, 0.08), rgba(255, 255, 255, 0));
}

.login-subtitle {
  opacity: 0.8;
  margin-top: 4px;
}

/* primary button styling that matches your purple theme */
.login-btn {
  background-color: #655b81;
  color: white;
  font-weight: 800;
  letter-spacing: 0.4px;
  border-radius: 12px;
}

.login-btn:hover {
  filter: brightness(0.95);
}

/* register row */
.register-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.register-link {
  text-decoration: none;
  font-weight: 700;
  color: #655b81;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
