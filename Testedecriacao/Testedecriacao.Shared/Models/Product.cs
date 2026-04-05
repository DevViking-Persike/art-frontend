namespace Testedecriacao.Shared.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string Category { get; set; } = "";
    public double Rating { get; set; }
    public int RatingCount { get; set; }
    public string? BadgeText { get; set; }
    public string? Description { get; set; }
}
