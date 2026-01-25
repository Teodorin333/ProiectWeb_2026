<template>
  <v-container class="pa-6" style="max-width: 1100px;">
    <h2>Demarează studii</h2>

    <div class="subtitle mt-2 mb-6">
      Selectează un studiu și apasă <strong>Pornește</strong>. După pornire, medicii nu îl mai pot modifica.
    </div>

    <v-alert v-if="error" type="error" class="my-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="success" type="success" class="my-4">
      Studiul a fost pornit.
    </v-alert>

    <div v-for="s in studies" :key="s.id" class="mb-6">
      <v-card class="pa-6">
        <div class="text-h5 font-weight-bold">{{ s.medicament }}</div>

        <div class="mt-2"><strong>Afectiune:</strong> {{ s.afectiune }}</div>
        <div class="mt-2"><strong>Descriere:</strong> {{ s.descriere || "—" }}</div>

        <div v-if="s.started" class="mt-3 started-text">
          În curs de desfășurare
        </div>

        <v-card-actions class="mt-4">
          <v-btn
            v-if="!s.started"
            class="start-btn"
            :loading="loadingId === s.id"
            @click="start(s)"
          >
            Pornește
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "AdminStudiesView",
  data() {
    return {
      studies: [],
      error: "",
      success: false,
      loadingId: ""
    };
  },

  async mounted() {
    await this.load();
  },

  methods: {
    getToken() {
      return localStorage.getItem("token");
    },

    async load() {
      try {
        this.error = "";
        const token = this.getToken();

        const res = await fetch("http://localhost:3000/admin/studies", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
          this.error = data.error || "Nu pot încărca studiile.";
          return;
        }

        this.studies = data.studies || [];
      } catch {
        this.error = "Nu pot încărca studiile.";
      }
    },

    async start(study) {
      this.error = "";
      this.success = false;
      this.loadingId = study.id;

      try {
        const token = this.getToken();
        const res = await fetch(`http://localhost:3000/admin/studies/${study.id}/start`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
          this.error = data.error || "Nu pot porni studiul.";
          return;
        }

        this.success = true;
        await this.load(); // refresh list so started updates
      } catch {
        this.error = "Nu pot porni studiul.";
      } finally {
        this.loadingId = "";
      }
    }
  }
};
</script>

<style scoped>
.subtitle { opacity: 0.8; }
.start-btn {
  background-color: #655b81;
  color: white;
  font-weight: 700;
}
.started-text {
  color: #655b81;
  font-weight: 700;
}
</style>
