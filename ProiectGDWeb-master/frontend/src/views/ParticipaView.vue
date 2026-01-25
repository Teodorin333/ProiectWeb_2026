<template>
  <v-container class="page py-10">
    <div class="shell">
      <!-- Header -->
      <div class="header">
        <div class="kicker">Sanofi Clinical Portal</div>
        <h2 class="title">Participă în Studiu</h2>
        <div class="subtitle">
          Completează datele pentru înscriere. Dacă ești deja într-un studiu început, vei primi instrucțiuni de la medic.
        </div>
      </div>

      <!-- Alerts -->
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
        Datele au fost salvate.
      </v-alert>

      <!-- Study started dialog -->
      <v-dialog v-model="studyStartedDialog" max-width="700">
        <v-card class="dialog-card pa-4">
          <div class="text-h6">Studiu în desfășurare</div>

          <div class="mt-2">
            Momentan ești înscris în studiul <strong>{{ studyStartedName }}</strong>.
            Așteaptă indicațiile medicului și urmează pașii oferiți de acesta.
          </div>

          <v-card-actions class="mt-4">
            <v-spacer />
            <v-btn class="action" @click="goHome">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Main panel -->
      <v-card class="panel" elevation="2">
        <v-form ref="formRef" v-model="formValid" class="mt-2">
          <!-- Date of birth -->
          <v-text-field
            v-model="dateOfBirth"
            label="Data nașterii"
            type="date"
            :rules="[rules.required, rules.mustBeAdult]"
            required
          />

          <!-- Study dropdown -->
          <v-select
            v-model="studyId"
            label="Studiul la care vrei să participi"
            :items="studies"
            item-title="name"
            item-value="id"
            :rules="[rules.required]"
            required
          />

          <!-- Allergies optional -->
          <v-textarea
            v-model="allergies"
            label="Alergii (opțional)"
            rows="3"
          />

          <!-- affected group (Yes/No) -->
          <div class="mt-2">
            <div class="mb-2 font-weight-medium">Sufăr de această condiție</div>

            <v-row>
              <v-col cols="auto">
                <v-checkbox
                  v-model="affectedGroupChoice"
                  :true-value="'yes'"
                  :false-value="null"
                  label="Da"
                  :rules="[rules.mustPickYesNo]"
                />
              </v-col>

              <v-col cols="auto">
                <v-checkbox
                  v-model="affectedGroupChoice"
                  :true-value="'no'"
                  :false-value="null"
                  label="Nu"
                  :rules="[rules.mustPickYesNo]"
                />
              </v-col>
            </v-row>
          </div>

          <!-- terms -->
          <v-checkbox
            v-model="acceptedTerms"
            label="Sunt de acord cu Termenii și Condițiile Sanofi"
            :rules="[rules.mustBeTrue]"
          />

          <v-btn
            class="mt-6 action"
            :loading="loading"
            block
            @click="submit"
          >
            Salvează
          </v-btn>
        </v-form>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.page {
  min-height: calc(100vh - 64px);
  background:
    radial-gradient(1200px 500px at 10% -10%, rgba(101, 91, 129, 0.25), transparent 60%),
    radial-gradient(900px 420px at 90% 0%, rgba(101, 91, 129, 0.18), transparent 55%),
    linear-gradient(180deg, #f6f3fb 0%, #ffffff 55%, #ffffff 100%);
}

.shell {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 16px;
}

.header {
  max-width: 760px;
  margin: 0 auto 18px auto;
}

.kicker {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 6px;
}

.title {
  font-size: 34px;
  line-height: 1.1;
  margin: 0;
}

.subtitle {
  margin-top: 10px;
  opacity: 0.8;
  line-height: 1.6;
}

.panel {
  border-radius: 18px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(101, 91, 129, 0.12);
}

.dialog-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(101, 91, 129, 0.12);
}

.action {
  background-color: #655b81;
  color: white;
  font-weight: 700;
  border-radius: 12px;
}

.action:hover {
  filter: brightness(0.96);
}
</style>


<script>
export default {
  name: "ParticipaView",

  data() {
    return {
      studies: [],
      loading: false,
      error: "",
      success: false,

      formValid: false,
      studyStartedDialog: false,
      studyStartedName: "",


      // form fields
      dateOfBirth: "",
      studyId: "",
      allergies: "",
      affectedGroupChoice: null,
      acceptedTerms: false,

      rules: {
  required: (v) => !!v || "Câmp obligatoriu",

  mustBeAdult: (v) => {
    if (!v) return true;

    const dob = new Date(v);
    if (Number.isNaN(dob.getTime())) return "Data nașterii nu este validă";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= 18 || "Trebuie să ai cel puțin 18 ani pentru a participa";
  },

  mustBeTrue: (v) => v === true || "Trebuie să fii de acord",
  mustPickYesNo: (v) => (v === "yes" || v === "no") || "Alege Da sau Nu",
}

    };
  },

  async mounted() {
    await this.loadStudies();
    await this.loadExistingData();
  },

  methods: {
    getToken() {
      return localStorage.getItem("token");
    },

    goHome() {
  this.studyStartedDialog = false;
  this.$router.push("/");
},



    async loadStudies() {
      try {
        this.error = "";
        const res = await fetch("http://localhost:3000/studies");
        const data = await res.json();
        this.studies = data.studies || [];
      } catch (e) {
        this.error = "Nu pot încărca lista de studii.";
      }
    },

    async loadExistingData() {
  try {
    const token = this.getToken();
    if (!token) return;

    const res = await fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // If it fails for any reason (404/401/500), just ignore silently
    if (!res.ok) return;

    const data = await res.json();

    if (data.studyStarted && data.studyName) {
  this.studyStartedName = data.studyName;
  this.studyStartedDialog = true;
}


    this.dateOfBirth = data.dateOfBirth || "";
    this.studyId = data.studyId || "";
    this.allergies = data.allergies || "";
    // if saved before, convert boolean -> "yes"/"no"
if (typeof data.affectedGroup === "boolean") {
  this.affectedGroupChoice = data.affectedGroup ? "yes" : "no";
}

    this.acceptedTerms = !!data.acceptedTerms;
  } catch (e) {
    // Silently ignore
  }
},

    async submit() {
      this.success = false;
      this.error = "";

      const ok = await this.$refs.formRef.validate();
      if (!ok) return;

      this.loading = true;
      try {
        const token = this.getToken();

if (!token) {
  this.error = "Nu ești logat. Te rog intră în cont din nou.";
  return;
}

const res = await fetch("http://localhost:3000/me/study", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    dateOfBirth: this.dateOfBirth,
    studyId: this.studyId,
    allergies: this.allergies,
    affectedGroup: this.affectedGroupChoice === "yes",

    acceptedTerms: this.acceptedTerms
  })
});

// Read response safely (sometimes backend returns non-JSON on errors)
const raw = await res.text();
let data = {};
try {
  data = raw ? JSON.parse(raw) : {};
} catch (e) {
  data = { error: raw };
}

if (!res.ok) {
  console.log("SAVE ERROR status:", res.status);
  console.log("SAVE ERROR body:", data);

  this.error = data.error || `Eroare la salvare (status ${res.status}).`;
  return;
}

this.success = true;

      } catch (e) {
        this.error = "Eroare la salvare.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
