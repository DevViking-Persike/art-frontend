using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace MauiDnaApp.Shared.Pages.Thinking;

public partial class Thinking : IAsyncDisposable
{
    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    private IJSObjectReference? module;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            module = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/MauiDnaApp.Shared/js/thinking.js");
            await module.InvokeVoidAsync("startThinkingAnimation", "thinkingCanvas");
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
