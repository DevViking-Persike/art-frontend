using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace MauiDnaApp.Shared.Pages.Neurons;

public partial class Neurons : IAsyncDisposable
{
    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    private IJSObjectReference? module;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            module = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/MauiDnaApp.Shared/js/neurons.js");
            await module.InvokeVoidAsync("startNeuronsAnimation", "neuronsCanvas");
        }
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        try
        {
            if (module is not null)
            {
                await module.DisposeAsync();
            }
        }
        catch (JSDisconnectedException)
        {
            // Circuit disconnected, safe to ignore
        }
    }
}
