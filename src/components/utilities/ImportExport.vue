<template>
  <a class="btn btn-secondary" @click.prevent="openModal">Import / export</a>

  <Modal title="Import/Export" ref="importExportModal">
    <template #body>
      <nav class="nav nav-pills flex-column flex-sm-row mb-3">
        <a class="flex-sm-fill text-sm-center nav-link" :class="{ active: isImport }" href="#" @click.prevent="isImport = true; validationMessage = null">Import</a>
        <a class="flex-sm-fill text-sm-center nav-link" :class="{ active: !isImport }" href="#" @click.prevent="isImport = false; validationMessage = null">Export</a>
      </nav>

      <div v-if="isImport" class="mb-3">
        <div class="form-group mb-3">
          <label for="import-file" class="form-label">Import file</label>
          <input type="file" accept="application/json" class="form-control" id="import-file" @change="handleFileInputChange" />
          <div class="invalid-feedback d-block" v-if="validationMessage">{{ validationMessage }}</div>
        </div>

        <div class="form-group">
          <label for="import-label-prefix" class="form-label">Import label prefix</label>
          <input type="text" class="form-control" id="import-label-prefix" v-model="importLabelPrefix" />
          <div id="importLabelPrefixHelp" class="form-text">Prefix all setup/defense labels you import so you can identify them easily.</div>
          <div><b>Example label:</b> {{ importLabelPrefix }} Boost Aura</div>
          <div class="invalid-feedback d-block" v-if="validationMessage">{{ validationMessage }}</div>
        </div>
      </div>

      <div v-if="!isImport" class="mb-3">

        <form>
          <div class="form-group mb-2">
            <label for="exportType" class="form-label">Export type</label>
            <select class="form-select" id="exportType" v-model="exportType">
              <option :value="0" selected>Choose export type</option>
              <option :value="1">Defenses</option>
              <option :value="2">Setups</option>
            </select>
            <div id="exportTypeHelp" class="form-text">If you export a setup, it's defenses will be automatically exported with it.</div>
          </div>

          <div class="form-group mb-2" v-if="exportType === 1">
            <label for="defenseExportSelection" class="form-label">Choose your defenses to export</label>
            <select class="form-select" id="defenseExportSelection" v-model="defenseExportSelection" multiple>
              <option v-for="defense in defenses" :key="defense.incrementId" :value="defense.incrementId">{{ defense.userData?.label }}</option>
            </select>
            <div class="invalid-feedback d-block" v-if="validationMessage">{{ validationMessage }}</div>
          </div>

          <div class="form-group mb-2" v-if="exportType === 2">
            <label for="defenseSetupExportSelection" class="form-label">Choose your setup to export</label>
            <select class="form-select" id="defenseSetupExportSelection" v-model="defenseSetupExportSelection">
              <option :value="0">All setups</option>
              <option v-for="setup in defenseSetups" :key="setup.incrementId" :value="setup.incrementId">{{ setup.label }}</option>
            </select>
            <div class="invalid-feedback d-block" v-if="validationMessage">{{ validationMessage }}</div>
          </div>
        </form>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-primary" @click.prevent="importData" v-if="isImport">Import</button>
      <button class="btn btn-primary" @click.prevent="exportData" v-if="!isImport">Export</button>
    </template>
  </Modal>

  <Modal title="Shared setup" is-large ref="sharedSetupModal">
    <template #body>
      <div class="shared-defenses" v-if="parsedDefenseSetup">
        <div class="row">
          <div class="col-md-6 col-lg-4 mb-3" v-for="(defense, index) in parsedDefenseSetup.defenses" :key="index">
            <DefensePreview :defense="defense" />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-primary" @click.prevent="importSharedData">Import this setup</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserDataStore } from "@/stores/UserData"
import { storeToRefs } from "pinia"

import type { UserDataStoreDefenseInterface } from "@/stores/UserData"
import type { UserDefenseSetupInterface, UserDefenseInterface, UserSetupDefenseInterface } from "@/types";

import Modal from "@/components/layout/BootstrapModal.vue";
import DefensePreview from "@/components/utilities/Defense/DefensePreview.vue";

const router = useRouter()
const userStore = useUserDataStore()
const { defenses, defenseSetups } = storeToRefs(userStore)
const { getNextDefenseIncrementId, getNextDefenseSetupIncrementId, importDefenses, importDefenseSetups } = userStore

const importExportModal = ref<typeof Modal|null>(null);
const sharedSetupModal = ref<typeof Modal|null>(null)

const isImport = ref<boolean>(true);
const exportType = ref<number>();
const importFile = ref();
const importLabelPrefix = ref<string>("");
const validationMessage = ref<null|string>(null);
const defenseExportSelection = ref<number[]>([]);
const defenseSetupExportSelection = ref<null|number>(null);
const parsedDefenseSetup = ref<ImportExportDataInterface|undefined>()

interface ImportExportDataInterface { defenses: UserDefenseInterface[], setups?: UserDefenseSetupInterface[] }

function openModal(): void {
  importExportModal.value?.show();
}

function importData(): void {
  if (!importFile.value) {
    validationMessage.value = "Please select a file"
    return
  }

  if (importFile.value.type !== "application/json") {
    validationMessage.value = "File must be a json file"
    return
  }

  const fileReader = new FileReader()
  fileReader.readAsText(importFile.value);

  fileReader.addEventListener('load', (e: ProgressEvent<FileReader>): void => {
    try {
      let data = JSON.parse(e.target?.result as string)
      validateImportData(data)

      data = remapData(data)

      importDefenses(data.defenses)
      if (data.setups) {
        importDefenseSetups(data.setups)
      }

      validationMessage.value = null
      importExportModal.value?.hide();
    } catch (e: any) {
      console.error(e)
      validationMessage.value = "Invalid import: " + (e as Error).message
      return
    }
  });
}

function handleFileInputChange(event: Event): void {
  const file = (event.currentTarget as HTMLInputElement)?.files?.[0];
  if (file) {
    importFile.value = file;
  }
}

function validateImportData(data: ImportExportDataInterface): void {
  if (!data.defenses) {
    throw new Error("Invalid file")
  }

  const defenses = data.defenses
  const setups = data.setups

  if (defenses.length === 0) {
    throw new Error("No defenses found")
  }

  if (setups && setups.length === 0) {
    throw new Error("No setups found")
  }
}

function remapData(data: any): object {
  const defenseIncrementIdMapping: {[oldIncrementId: number]: number} = {}

  // Remap incrementIds
  let nextDefenseIncrementId = getNextDefenseIncrementId()
  data.defenses.map((defense: UserDefenseInterface) => {
    defenseIncrementIdMapping[defense.incrementId] = nextDefenseIncrementId
    defense.incrementId = nextDefenseIncrementId
    if (importLabelPrefix.value !== "") {
      defense.label = importLabelPrefix.value + " " + defense.label
    }

    nextDefenseIncrementId++

    return defense
  })

  let nextDefenseSetupIncrementId = getNextDefenseSetupIncrementId()
  if (data.setups) {
    data.setups.map((setup: UserDefenseSetupInterface) => {
      setup.incrementId = nextDefenseSetupIncrementId
      if (importLabelPrefix.value !== "") {
        setup.label = importLabelPrefix.value + " " + setup.label
      }

      if (setup.defensesIncrementIds) {
        setup.defensesIncrementIds = (setup.defensesIncrementIds as number[]).map((defenseIncrementId: number) => defenseIncrementIdMapping[defenseIncrementId])
      } else {
        let mappedDefenses: { [defensesIncrementId: number]: UserSetupDefenseInterface } = {}
        for (const defensesIncrementId in setup.defenses) {
          mappedDefenses[defenseIncrementIdMapping[defensesIncrementId]] = setup.defenses[defensesIncrementId]
        }
        setup.defenses = mappedDefenses
      }

      nextDefenseSetupIncrementId++

      return setup
    })
  }

  return data
}

function exportData(): void {
  let fileName: string
  let exportDefenses: UserDataStoreDefenseInterface[]
  let exportSetups: UserDefenseSetupInterface[]
  let data: { defenses: UserDefenseInterface[]|UserDataStoreDefenseInterface[], setups?: UserDefenseSetupInterface[] }
  switch (exportType.value) {
    case 1:
      if (defenseExportSelection.value.length === 0) {
        validationMessage.value = "Please select at least one defense"
        return
      }

      fileName = "defenses_export.json"
      exportDefenses = defenses.value.filter((setup) => defenseExportSelection.value.includes(setup.incrementId))
      data = {defenses: exportDefenses}
      break;
    case 2:
      if (defenseSetupExportSelection.value === null) {
        validationMessage.value = "Please select a setup"
        return
      }

      fileName = "setups_export.json"
      switch (defenseSetupExportSelection.value) {
        case 0:
          exportSetups = defenseSetups.value
          break;
        default:
          exportSetups = defenseSetups.value.filter((setup) => setup.incrementId === defenseSetupExportSelection.value)
          break;
      }

      exportDefenses = getDefensesFromSetups(exportSetups)
      data = {defenses: exportDefenses, setups: exportSetups}
      break;
    default:
      return
  }

  // Make sure defenses only contain user data
  data.defenses = data.defenses.map((defense: UserDefenseInterface | UserDataStoreDefenseInterface) => ('userData' in defense ? defense.userData : defense) as UserDefenseInterface);

  download(JSON.stringify(data), fileName, "application/json");
}

function download(content: string, fileName: string, contentType: string): void {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function getDefensesFromSetups(setups: UserDefenseSetupInterface[]): UserDataStoreDefenseInterface[] {
  const setupDefenses: {[defenseIncrementId: number]: UserDataStoreDefenseInterface} = []
  setups.forEach((setup: UserDefenseSetupInterface) => {
    for (const index in setup.defenses) {
      const defenseIncrementId: number = parseInt(index)
      if (!(defenseIncrementId in setupDefenses)) {
        setupDefenses[defenseIncrementId] = defenses.value.find((defense) => defense.incrementId === defenseIncrementId) as UserDataStoreDefenseInterface
      }
    }
  })

  return Object.values(setupDefenses)
}

function importSharedData(): void {
  let data: ImportExportDataInterface = remapData(parsedDefenseSetup.value) as ImportExportDataInterface

  importDefenses(data.defenses)
  if (data.setups) {
    importDefenseSetups(data.setups)
  }

  let url = new URL(location.href);
  url.searchParams.delete('shared');
  window.history.pushState({}, document.title, url);

  sharedSetupModal.value?.hide();

  router.push({name: 'calculator.defense'});
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const defenseSetup = urlParams.get('shared');
  parsedDefenseSetup.value = defenseSetup ? JSON.parse(defenseSetup) as ImportExportDataInterface : undefined;

  if (parsedDefenseSetup.value) {
    sharedSetupModal.value?.show();
  }
});
</script>
