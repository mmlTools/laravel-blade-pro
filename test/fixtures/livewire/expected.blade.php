<form wire:submit="save">
    <input wire:model.live="name">
    <button wire:loading.attr="disabled">Save</button>
</form>
