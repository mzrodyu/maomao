const Settings = z
  .object({
    button_selected: z.boolean().default(false),
  })
  .prefault({});

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(Settings.parse(getVariables({ type: 'script', script_id: getScriptId() })));

<<<<<<< HEAD
  watch(
    settings,
    new_settings => {
      insertOrAssignVariables(klona(new_settings), { type: 'script', script_id: getScriptId() });
    },
    { immediate: true, deep: true },
  );
  return {
    settings,
  };
=======
  watchEffect(() => {
    insertOrAssignVariables(klona(settings.value), { type: 'script', script_id: getScriptId() });
  });

  return { settings };
>>>>>>> 4dd206c0dc4e487a36681a4080d0394c48b95fc5
});
