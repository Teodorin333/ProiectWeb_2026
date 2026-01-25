<template>
  <v-container class="pa-6" style="max-width: 1100px;">
    <h2>Studiu pentru {{ medicamentTitle }}</h2>

    <v-alert v-if="error" type="error" class="my-4">
      {{ error }}
    </v-alert>

    <v-card class="pa-6 mt-4">
      <div class="text-h6 mb-4">Participanți:</div>

      <div v-if="loading" class="py-4">Se încarcă...</div>

      <div v-else-if="participants.length === 0" class="py-4">
        Nu există participanți înscriși în acest studiu.
      </div>

      <v-list v-else>
        <v-list-item
          v-for="p in participants"
          :key="p.id"
          class="mb-2"
        >
          <v-list-item-title class="font-weight-medium">
            {{ p.name || "—" }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ p.email || "" }}
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex align-center ga-4">
              <v-checkbox
                v-model="p.placebo"
                label="Placebo"
                hide-details
                @update:modelValue="(val) => updatePlacebo(p, val)"
              />

              <v-btn color="error" variant="tonal" @click="removeFromStudy(p)">
                Elimină
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-snackbar v-model="snackbar" timeout="2500">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "DoctorStudyView",

  data() {
    return {
      participants: [],
      error: "",
      loading: false,

      medicamentTitle: "—",

      snackbar: false,
      snackbarText: ""
    };
  },

  async mounted() {
    await this.loadStudyTitle();
    await this.loadParticipants();
  },

  methods: {
    getToken() {
      return localStorage.getItem("token");
    },

    getStudyId() {
      return this.$route.params.studyId;
    },

    async loadStudyTitle() {
      // We can reuse /doctor/studies and find the matching study
      try {
        const token = this.getToken();
        const res = await fetch("http://localhost:3000/doctor/studies", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) return;

        const study = (data.studies || []).find(s => s.id === this.getStudyId());
        this.medicamentTitle = study?.medicament || study?.name || "—";
      } catch {
        // ignore; title just stays —
      }
    },

    async loadParticipants() {
      this.loading = true;
      this.error = "";
      try {
        const token = this.getToken();
        const studyId = this.getStudyId();

        const res = await fetch(`http://localhost:3000/doctor/studies/${studyId}/participants`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
          this.error = data.error || "Nu pot încărca participanții.";
          return;
        }

        this.participants = data.participants || [];
      } catch (e) {
        this.error = "Nu pot încărca participanții.";
      } finally {
        this.loading = false;
      }
    },

    async updatePlacebo(pacient, val) {
      // optimistic already applied because v-model updated
      try {
        const token = this.getToken();
        const res = await fetch(`http://localhost:3000/doctor/pacienti/${pacient.id}/placebo`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ placebo: !!val })
        });

        const data = await res.json();
        if (!res.ok) {
          this.snackbarText = data.error || "Eroare la setare placebo.";
          this.snackbar = true;
          // rollback UI
          pacient.placebo = !val;
          return;
        }

        this.snackbarText = `Placebo: ${val ? "DA" : "NU"}`;
        this.snackbar = true;
      } catch {
        this.snackbarText = "Eroare la setare placebo.";
        this.snackbar = true;
        // rollback UI
        pacient.placebo = !val;
      }
    },

    async removeFromStudy(pacient) {
      try {
        const token = this.getToken();
        const res = await fetch(`http://localhost:3000/doctor/pacienti/${pacient.id}/study`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
          this.snackbarText = data.error || "Eroare la eliminare.";
          this.snackbar = true;
          return;
        }

        // remove from list immediately
        this.participants = this.participants.filter(x => x.id !== pacient.id);

        this.snackbarText = "Pacient eliminat din studiu.";
        this.snackbar = true;
      } catch {
        this.snackbarText = "Eroare la eliminare.";
        this.snackbar = true;
      }
    }
  }
};
</script>
