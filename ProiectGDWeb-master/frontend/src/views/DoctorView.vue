<template>
  <v-container class="pa-6" style="max-width: 1100px;">
    <h2>Studii în derulare</h2>

    <div class="subtitle mt-2 mb-6">
      Aici poți vedea toate studiile existente în platformă.
    </div>

    <v-alert v-if="error" type="error" class="my-4">
      {{ error }}
    </v-alert>

    <div v-for="s in studies" :key="s.id" class="mb-6">
      <v-card class="pa-6">
        <div class="text-h5 font-weight-bold">{{ s.medicament }}</div>

        <div class="mt-3">
          <strong>Afectiune:</strong> {{ s.afectiune }}
        </div>

        <div class="mt-3">
          <strong>Descriere:</strong> {{ s.descriere || "—" }}
        </div>

        <div v-if="s.started" class="mt-4 started-text">
  În curs de desfășurare
</div>

<v-card-actions v-else class="mt-4">
  <v-btn color="primary" @click="openStudy(s)">
    Vezi participanți
  </v-btn>
</v-card-actions>


      </v-card>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "StudiesDoctorView",

  data() {
    return {
      studies: [],
      error: ""
    };
  },

  async mounted() {
    await this.loadStudies();
  },

  methods: {
    async loadStudies() {
      try {
        this.error = "";
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/doctor/studies", {
        headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
          this.error = data.error || "Nu pot încărca studiile.";
          return;
        }
        this.studies = data.studies || [];
      } catch (e) {
        this.error = "Nu pot încărca studiile.";
      }
    },

    openStudy(study) {
  this.$router.push(`/studii-derulare/${study.id}`);
    },

  }
};
</script>

<style scoped>
.subtitle {
  opacity: 0.8;
}

.started-text {
  color: #655b81;
  font-weight: 700;
}

</style>
