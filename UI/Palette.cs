namespace ParkingLotSlotAllocator.UI;

using System.Drawing;
using System.Drawing.Drawing2D;

public static class Palette
{
    // ==========================================
    // EXACT THEME COLORS FROM USER PALETTE
    // ==========================================
    // 1. Cosmic Latte: #B7A89A, RGB(183, 168, 154)
    public static readonly Color CosmicLatte = Color.FromArgb(183, 168, 154);

    // 2. Mocha Cream: #E8DCC6, RGB(232, 220, 198)
    public static readonly Color MochaCream = Color.FromArgb(232, 220, 198);

    // 3. Deep Burgundy: #722F37, RGB(114, 47, 55)
    public static readonly Color DeepBurgundy = Color.FromArgb(114, 47, 55);

    // ==========================================
    // HARMONIZED LIGHT THEME SURFACES
    // ==========================================
    // Background canvas: Clean, warm ivory / latte light surface
    public static readonly Color BackgroundCanvas = Color.FromArgb(251, 248, 243); // Warm Ivory
    public static readonly Color BackgroundSubtle = Color.FromArgb(243, 237, 228); // Soft Mocha Tint
    public static readonly Color SurfaceCard = Color.FromArgb(255, 255, 255);      // Pure Crisp White
    public static readonly Color SurfaceHover = Color.FromArgb(249, 245, 239);     // Cream White Hover

    // Primary Accents (Powered by Deep Burgundy)
    public static readonly Color Primary = DeepBurgundy;                           // #722F37
    public static readonly Color PrimaryHover = Color.FromArgb(92, 36, 43);        // Rich Darker Burgundy
    public static readonly Color PrimaryActive = Color.FromArgb(74, 28, 34);       // Deepest Plum Burgundy
    public static readonly Color PrimaryLight = Color.FromArgb(248, 239, 240);     // Very Soft Burgundy Cream
    public static readonly Color PrimaryBorder = Color.FromArgb(209, 167, 172);    // Soft Burgundy Border

    // Secondary Accents (Powered by Cosmic Latte & Mocha Cream)
    public static readonly Color Secondary = CosmicLatte;                         // #B7A89A
    public static readonly Color SecondaryDark = Color.FromArgb(143, 126, 110);    // Deep Warm Latte
    public static readonly Color SecondaryLight = MochaCream;                      // #E8DCC6
    public static readonly Color SecondaryBorder = Color.FromArgb(215, 203, 188);

    // Semantic Status Colors (Warm-tuned to harmonize with Burgundy and Cream)
    public static readonly Color Success = Color.FromArgb(51, 112, 70);           // Heritage Forest Green
    public static readonly Color SuccessLight = Color.FromArgb(239, 247, 241);    // Soft Mint Cream
    public static readonly Color SuccessBorder = Color.FromArgb(184, 222, 196);

    public static readonly Color Warning = Color.FromArgb(176, 115, 41);          // Warm Amber Caramel
    public static readonly Color WarningLight = Color.FromArgb(254, 247, 237);    // Warm Amber Cream
    public static readonly Color WarningBorder = Color.FromArgb(245, 218, 185);

    public static readonly Color Danger = Color.FromArgb(155, 44, 53);            // Crimson Burgundy
    public static readonly Color DangerLight = Color.FromArgb(253, 241, 242);     // Rose Cream
    public static readonly Color DangerBorder = Color.FromArgb(245, 198, 202);

    public static readonly Color EVColor = Color.FromArgb(47, 126, 121);          // Warm Sea Sage / Spruce
    public static readonly Color EVLight = Color.FromArgb(237, 247, 246);
    public static readonly Color EVBorder = Color.FromArgb(181, 222, 220);

    // Subtle Borders & Shadows
    public static readonly Color BorderSubtle = Color.FromArgb(232, 220, 198);    // Mocha Cream Border
    public static readonly Color BorderStrong = Color.FromArgb(183, 168, 154);    // Cosmic Latte Border

    // Typography (Warm Espresso & Taupe)
    public static readonly Color TextPrimary = Color.FromArgb(38, 21, 23);         // Deep Roasted Plum / Espresso
    public static readonly Color TextSecondary = Color.FromArgb(93, 79, 75);      // Warm Chestnut Taupe
    public static readonly Color TextMuted = Color.FromArgb(142, 126, 118);       // Muted Cosmic Latte
    public static readonly Color TextWhite = Color.FromArgb(255, 255, 255);

    // Elegant Display Font (Graceful Serif / Clean Sans)
    public static Font FontDisplay(float size, FontStyle style = FontStyle.Bold)
    {
        string[] fontCandidates = { "Georgia", "Palatino Linotype", "Segoe UI Variable Display", "Segoe UI", "Arial" };
        foreach (var name in fontCandidates)
        {
            try
            {
                using var test = new Font(name, size, style);
                if (test.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                {
                    return new Font(name, size, style);
                }
            }
            catch { }
        }
        return new Font(FontFamily.GenericSerif, size, style);
    }

    public static Font FontBody(float size, FontStyle style = FontStyle.Regular)
    {
        string[] fontCandidates = { "Segoe UI Variable Text", "Segoe UI", "Arial" };
        foreach (var name in fontCandidates)
        {
            try
            {
                using var test = new Font(name, size, style);
                if (test.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                {
                    return new Font(name, size, style);
                }
            }
            catch { }
        }
        return new Font(FontFamily.GenericSansSerif, size, style);
    }

    public static GraphicsPath CreateRoundedRectangle(Rectangle bounds, int radius)
    {
        int diameter = radius * 2;
        var path = new GraphicsPath();

        if (radius <= 0)
        {
            path.AddRectangle(bounds);
            return path;
        }

        var arc = new Rectangle(bounds.Location, new Size(diameter, diameter));

        // Top-left
        path.AddArc(arc, 180, 90);

        // Top-right
        arc.X = bounds.Right - diameter;
        path.AddArc(arc, 270, 90);

        // Bottom-right
        arc.Y = bounds.Bottom - diameter;
        path.AddArc(arc, 0, 90);

        // Bottom-left
        arc.X = bounds.Left;
        path.AddArc(arc, 90, 90);

        path.CloseFigure();
        return path;
    }

    public static void DrawShadow(Graphics g, Rectangle bounds, int radius, int shadowDepth = 4, int opacity = 14)
    {
        for (int i = 1; i <= shadowDepth; i++)
        {
            var shadowRect = new Rectangle(
                bounds.X - i,
                bounds.Y + (i * 2) - i,
                bounds.Width + (i * 2),
                bounds.Height + (i * 2)
            );

            using var path = CreateRoundedRectangle(shadowRect, radius + i);
            int alpha = Math.Max(2, opacity - (i * (opacity / shadowDepth)));
            // Warm subtle shadow using espresso tone
            using var shadowBrush = new SolidBrush(Color.FromArgb(alpha, 60, 40, 42));
            g.FillPath(shadowBrush, path);
        }
    }
}
