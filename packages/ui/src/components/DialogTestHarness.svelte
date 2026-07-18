<script lang="ts">
	import Dialog from './Dialog.svelte';
</script>

<Dialog title="Keyboard dialog" description="Focus behavior">
	{#snippet trigger()}Open keyboard dialog{/snippet}
	<button type="button">Inside dialog</button>
</Dialog>
