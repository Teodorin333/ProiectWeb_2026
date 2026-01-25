<template>
  <v-container class="pa-6" style="max-width: 800px;">
    <h2>Participă în Studiu</h2>

    <v-alert v-if="error" type="error" class="my-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="success" type="success" class="my-4">
      Datele au fost salvate.
    </v-alert>

    <v-dialog v-model="studyStartedDialog" max-width="700">
  <v-card class="pa-4">
    <div class="text-h6">Studiu în desfășurare</div>

    <div class="mt-2">
      Momentan ești înscris în studiul <strong>{{ studyStartedName }}</strong>.
      Așteaptă indicațiile medicului și urmează pașii oferiți de acesta.
    </div>

    <v-card-actions class="mt-4">
      <v-spacer />
     <v-btn color="primary" @click="goHome">OK</v-btn>

    </v-card-actions>
  </v-card>
</v-dialog>


    <v-form ref="formRef" v-model="formValid" class="mt-4">
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

      <v-btn class="mt-4" :loading="loading" @click="submit">
        Salvează
      </v-btn>
    </v-form>
  </v-container>
</template>

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
  this.startedDialog = false;
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
