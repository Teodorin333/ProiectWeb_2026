<template>
  <v-container class="pa-6" style="max-width: 1100px;">
    <div class="header-block">
  <h2>Studii Disponibile</h2>

  <p class="subtitle">
    Aici găsești lista studiilor clinice disponibile în acest moment. Citește descrierea fiecărui studiu și apasă
    <strong>Participă</strong> pentru a te înscrie. De asemenea, daca participi deja la un studiu, il poti schimba de aici,
    sau din pagina ta personala de date.
  </p>
</div>



    <v-alert v-if="error" type="error" class="my-4">
      {{ error }}
    </v-alert>

   <v-row v-if="!lockedByStartedStudy" class="mt-6" justify="center">

  <v-col
    v-for="s in studies"
    :key="s.id"
    cols="12"
    class="study-col"
  >
    <v-card class="study-card" elevation="2">
      <!-- Title: medication -->
      <div class="text-h5 font-weight-bold">
        {{ s.medicament }}
      </div>

      <!-- Afectiune -->
      <div class="text-body-1 mt-3">
        <strong>Afectiune:</strong> {{ s.afectiune }}
      </div>

      <!-- Descriere -->
      <div class="text-body-1 mt-2">
        <strong>Descriere:</strong> {{ s.descriere }}
      </div>

      <v-card-actions class="mt-4">
        <v-btn class="participa-btn" @click="tryEnroll(s)">
          Participă
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>



    <!-- success dialog -->
    <v-dialog v-model="successDialog" max-width="520">
      <v-card class="pa-4">
        <div class="text-h6">Succes</div>
        <div class="mt-2">Te-ai înscris la studiul: <strong>{{ enrolledStudyName }}</strong></div>
        <v-card-actions class="mt-4">
          <v-spacer />
          <v-btn color="primary" @click="successDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- confirm switch dialog -->
    <v-dialog v-model="confirmDialog" max-width="650">
      <v-card class="pa-4">
        <div class="text-h6">Confirmare</div>

        <div class="mt-2">
          Ești deja înscris la studiul <strong>{{ currentStudyName }}</strong>.<br />
          Dorești să te înscrii în studiul <strong>{{ targetStudyName }}</strong>?
        </div>

        <v-card-actions class="mt-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Nu</v-btn>
          <v-btn color="primary" :loading="loading" @click="confirmSwitch">Da</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- study started dialog -->
<v-dialog v-model="startedDialog" max-width="700">
  <v-card class="pa-4">
    <div class="text-h6">Studiu în desfășurare</div>

    <div class="mt-2">
      Momentan ești înscris în studiul <strong>{{ startedStudyName }}</strong>.
      Așteaptă indicațiile medicului și urmează pașii oferiți de acesta.
    </div>

    <v-card-actions class="mt-4">
      <v-spacer />
      <v-btn color="primary" @click="goHome">OK</v-btn>

    </v-card-actions>
  </v-card>
</v-dialog>

  </v-container>
</template>

<script>
export default {
  name: "StudiesView",

  data() {
    return {
      studies: [],
      error: "",
      loading: false,

      // dialogs
      successDialog: false,
      enrolledStudyName: "",
      startedDialog: false,
      startedStudyName: "",
      lockedByStartedStudy: false,
    lockedStudyName: "",



      confirmDialog: false,
      currentStudyName: "",
      targetStudyName: "",
      pendingStudyId: ""
    };
  },

  async mounted() {
  await this.checkLock();
  if (!this.lockedByStartedStudy) {
    await this.loadStudies();
  }
},


  methods: {
    getToken() {
      return localStorage.getItem("token");
    },

    goHome() {
  this.startedDialog = false;
  this.$router.push("/");
},

    async checkLock() {
  try {
    const token = this.getToken();
    if (!token) return;

    const res = await fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const me = await res.json();

    if (me.studyStarted) {
      this.lockedByStartedStudy = true;
      this.startedStudyName = me.studyName || "acest studiu";
      this.startedDialog = true; // reuse your existing popup
    }
  } catch (e) {
    // ignore
  }
},


    async loadStudies() {
      try {
        this.error = "";
        const res = await fetch("http://localhost:3000/studies");
        const data = await res.json();
        this.studies = data.studies || [];
      } catch (e) {
        this.error = "Nu pot încărca studiile.";
      }
    },

    async tryEnroll(study) {
      this.error = "";
      this.loading = true;

      try {
        // if study already started -> show info dialog (backend also blocks)
        if (study.started) {
        this.startedStudyName = study.name || `${study.afectiune} - ${study.medicament}`;
        this.startedDialog = true;
        this.loading = false;
        return;
        }

        const token = this.getToken();
        const res = await fetch("http://localhost:3000/me/enroll", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ studyId: study.id })
        });

        const data = await res.json();

        // ✅ NEW: pacient is locked in an already-started study
        if (res.status === 423 && data.error === "already_in_started_study") {
        this.lockedByStartedStudy = true;
        this.startedStudyName = data.studyName || "acest studiu";
        this.startedDialog = true;
        return;
        }


        if (res.status === 423 && data.error === "study_started") {
        this.startedStudyName = data.studyName || study.name;
        this.startedDialog = true;
        return;
        }


        // already enrolled -> open confirm dialog
        if (res.status === 409 && data.error === "already_enrolled") {
          this.currentStudyName = data.currentStudyName || "studiul curent";
          this.targetStudyName = data.targetStudyName || study.name;
          this.pendingStudyId = study.id;
          this.confirmDialog = true;
          return;
        }

        if (!res.ok) {
          this.error = data.error || "Eroare la înscriere.";
          return;
        }

        this.enrolledStudyName = data.studyName || study.name;
        this.successDialog = true;
      } catch (e) {
        this.error = "Eroare la înscriere.";
      } finally {
        this.loading = false;
      }
    },

    async confirmSwitch() {
      this.loading = true;
      this.error = "";
      try {
        const token = this.getToken();
        const res = await fetch("http://localhost:3000/me/enroll", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ studyId: this.pendingStudyId, force: true })
        });

        const data = await res.json();
        if (!res.ok) {
          this.error = data.error || "Eroare la schimbare.";
          return;
        }

        this.confirmDialog = false;
        this.enrolledStudyName = data.studyName || this.targetStudyName;
        this.successDialog = true;
      } catch (e) {
        this.error = "Eroare la schimbare.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.study-col {
  max-width: 900px; /* makes each card wide & centered */
}

.study-card {
  padding: 24px;
  width: 100%;
  background: white;
}

.participa-btn {
  background-color: #655b81; /* purple */
  color: white;
  font-weight: 700;
}

.participa-btn:hover {
  filter: brightness(0.95);
}

.header-block {
  max-width: 900px;
  margin: 0 auto 24px auto; /* center + space below */
}

.header-block h2 {
  margin-bottom: 8px;
}

.subtitle {
  color: #444;
  font-size: 16px;
  line-height: 1.6;
}


</style>
