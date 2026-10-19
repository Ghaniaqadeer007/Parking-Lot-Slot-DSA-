namespace ParkingLotSlotAllocator.UI;

using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

public class ModernCard : Panel
{
    private int _borderRadius = 16;
    private Color _cardColor = Palette.SurfaceCard;
    private Color _borderColor = Palette.BorderSubtle;
    private bool _showShadow = true;

    [Category("Appearance")]
    public int BorderRadius
    {
        get => _borderRadius;
        set { _borderRadius = value; Invalidate(); }
    }

    [Category("Appearance")]
    public Color CardColor
    {
        get => _cardColor;
        set { _cardColor = value; Invalidate(); }
    }

    [Category("Appearance")]
    public Color BorderColor
    {
        get => _borderColor;
        set { _borderColor = value; Invalidate(); }
    }

    [Category("Appearance")]
    public bool ShowShadow
    {
        get => _showShadow;
        set { _showShadow = value; Invalidate(); }
    }

    public ModernCard()
    {
        SetStyle(ControlStyles.AllPaintingInWmPaint |
                 ControlStyles.UserPaint |
                 ControlStyles.OptimizedDoubleBuffer |
                 ControlStyles.ResizeRedraw, true);

        BackColor = Color.Transparent;
        Padding = new Padding(16);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;

        int margin = _showShadow ? 5 : 1;
        var cardRect = new Rectangle(margin, margin, Width - (margin * 2) - 1, Height - (margin * 2) - 1);

        if (_showShadow)
        {
            Palette.DrawShadow(g, cardRect, _borderRadius, shadowDepth: 3, opacity: 12);
        }

        using var path = Palette.CreateRoundedRectangle(cardRect, _borderRadius);

        // Fill card background
        using var bgBrush = new SolidBrush(_cardColor);
        g.FillPath(bgBrush, path);

        // Stroke subtle border
        if (_borderColor != Color.Transparent)
        {
            using var borderPen = new Pen(_borderColor, 1f);
            g.DrawPath(borderPen, path);
        }
    }
}
