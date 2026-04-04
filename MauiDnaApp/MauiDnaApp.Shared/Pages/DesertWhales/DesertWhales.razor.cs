using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace MauiDnaApp.Shared.Pages.DesertWhales;

public partial class DesertWhales : IAsyncDisposable
{
    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    private IJSObjectReference? module;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            var jsVersion = Guid.NewGuid().ToString();
            module = await JSRuntime.InvokeAsync<IJSObjectReference>("import", $"./_content/MauiDnaApp.Shared/js/desertwhales.js?v={jsVersion}");
            await module.InvokeVoidAsync("startDesertWhalesAnimation", "desertCanvas");
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
        }
    }
}
