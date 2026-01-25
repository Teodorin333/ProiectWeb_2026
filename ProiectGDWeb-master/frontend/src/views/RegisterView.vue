<template>
  <div class="register-page">
    <v-container class="py-12" style="max-width: 560px;">
      <v-card class="register-card" elevation="8">
        <!-- Header -->
        <div class="register-header">
          <div class="text-h5 font-weight-bold">Creare cont</div>
          <div class="text-body-2 register-subtitle">
            Completează datele pentru a te înregistra ca pacient.
          </div>
        </div>

        <v-divider />

        <v-card-text class="pt-6">
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
            {{ successMessage }}
          </v-alert>

          <v-form v-model="form" @submit.prevent="onSubmit">
            <v-text-field
              v-model="name"
              :readonly="loading"
              :rules="[required]"
              label="Nume"
              variant="outlined"
              density="comfortable"
              clearable
              prepend-inner-icon="mdi-account-outline"
              class="mb-3"
            />

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
              :rules="[required, min8]"
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
              class="register-btn mt-4"
              type="submit"
              block
              size="large"
            >
              Register
            </v-btn>

            <div class="mt-5 text-body-2 login-row">
              <span>Ai deja cont?</span>
              <router-link to="/login" class="login-link">
                Login
              </router-link>
            </div>
          </v-form>
        </v-card-text>
      </v-card>

      <p class="copyright mt-8">
        © Anofi 2004-2025 - All rights reserved
      </p>
    </v-container>
  </div>
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
.register-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  background:
    radial-gradient(900px 500px at 20% 10%, rgba(101, 91, 129, 0.18), transparent 60%),
    radial-gradient(700px 400px at 80% 20%, rgba(30, 136, 229, 0.14), transparent 55%),
    #f6f7fb;
}

.register-card {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(30, 41, 59, 0.08);
}

.register-header {
  padding: 22px 24px 16px 24px;
  background: linear-gradient(180deg, rgba(101, 91, 129, 0.08), rgba(255, 255, 255, 0));
}

.register-subtitle {
  opacity: 0.8;
  margin-top: 4px;
}

.register-btn {
  background-color: #655b81;
  color: white;
  font-weight: 800;
  letter-spacing: 0.4px;
  border-radius: 12px;
}

.register-btn:hover {
  filter: brightness(0.95);
}

.login-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.login-link {
  text-decoration: none;
  font-weight: 700;
  color: #655b81;
}

.login-link:hover {
  text-decoration: underline;
}

.copyright {
  text-align: center;
  opacity: 0.75;
}
</style>

