namespace ParkingLotSlotAllocator.UI;

using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

public enum ModernButtonStyle
{
    Primary,
    Secondary,
    Ghost,
    Success,
    Danger
}

public class ModernButton : Button
{
    private bool _isHovered = false;
    private bool _isPressed = false;
    private int _borderRadius = 12;
    private ModernButtonStyle _buttonStyle = ModernButtonStyle.Primary;

    [Category("Appearance")]
    public int BorderRadius
    {
        get => _borderRadius;
        set { _borderRadius = value; Invalidate(); }
    }

    [Category("Appearance")]
    public ModernButtonStyle ButtonStyle
    {
        get => _buttonStyle;
        set { _buttonStyle = value; Invalidate(); }
    }

    public ModernButton()
    {
        SetStyle(ControlStyles.AllPaintingInWmPaint |
                 ControlStyles.UserPaint |
                 ControlStyles.OptimizedDoubleBuffer |
                 ControlStyles.ResizeRedraw, true);

        FlatStyle = FlatStyle.Flat;
        FlatAppearance.BorderSize = 0;
        BackColor = Color.Transparent;
        Cursor = Cursors.Hand;
        Font = Palette.FontBody(10.5f, FontStyle.Bold);
        Size = new Size(160, 44);
    }

    protected override void OnMouseEnter(EventArgs e)
    {
        base.OnMouseEnter(e);
        _isHovered = true;
        Invalidate();
    }

    protected override void OnMouseLeave(EventArgs e)
    {
        base.OnMouseLeave(e);
        _isHovered = false;
        _isPressed = false;
        Invalidate();
    }

    protected override void OnMouseDown(MouseEventArgs mevent)
    {
        base.OnMouseDown(mevent);
        _isPressed = true;
        Invalidate();
    }

    protected override void OnMouseUp(MouseEventArgs mevent)
    {
        base.OnMouseUp(mevent);
        _isPressed = false;
        Invalidate();
    }

    protected override void OnPaint(PaintEventArgs pevent)
    {
        var g = pevent.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        var rect = new Rectangle(0, 0, Width - 1, Height - 1);
        if (_isPressed)
        {
            rect = new Rectangle(1, 1, Width - 2, Height - 2);
        }

        // Determine colors based on style and state
        Color bgStart, bgEnd, textColor, borderColor;

        switch (ButtonStyle)
        {
            case ModernButtonStyle.Primary:
                bgStart = _isPressed ? Palette.PrimaryActive : (_isHovered ? Palette.PrimaryHover : Palette.Primary);
                bgEnd = _isPressed ? Palette.PrimaryActive : (_isHovered ? Palette.Primary : Color.FromArgb(138, 58, 67));
                textColor = Palette.TextWhite;
                borderColor = Color.Transparent;
                break;

            case ModernButtonStyle.Secondary:
                bgStart = _isHovered ? Color.FromArgb(220, 204, 178) : Palette.MochaCream;
                bgEnd = bgStart;
                textColor = Palette.DeepBurgundy;
                borderColor = Palette.CosmicLatte;
                break;

            case ModernButtonStyle.Success:
                bgStart = _isHovered ? Color.FromArgb(40, 92, 57) : Palette.Success;
                bgEnd = bgStart;
                textColor = Palette.TextWhite;
                borderColor = Color.Transparent;
                break;

            case ModernButtonStyle.Danger:
                bgStart = _isHovered ? Color.FromArgb(130, 32, 40) : Palette.Danger;
                bgEnd = bgStart;
                textColor = Palette.TextWhite;
                borderColor = Color.Transparent;
                break;

            case ModernButtonStyle.Ghost:
            default:
                bgStart = _isHovered ? Palette.BackgroundSubtle : Palette.SurfaceCard;
                bgEnd = bgStart;
                textColor = _isHovered ? Palette.DeepBurgundy : Palette.TextPrimary;
                borderColor = _isHovered ? Palette.PrimaryBorder : Palette.BorderSubtle;
                break;
        }

        // Draw shadow on hover for primary
        if (_isHovered && !_isPressed && ButtonStyle == ModernButtonStyle.Primary)
        {
            using var shadowPath = Palette.CreateRoundedRectangle(new Rectangle(2, 4, Width - 5, Height - 4), BorderRadius);
            using var shadowBrush = new SolidBrush(Color.FromArgb(40, 114, 47, 55));
            g.FillPath(shadowBrush, shadowPath);
        }

        using var path = Palette.CreateRoundedRectangle(rect, BorderRadius);

        // Fill background
        if (bgStart != bgEnd)
        {
            using var brush = new LinearGradientBrush(rect, bgStart, bgEnd, 45f);
            g.FillPath(brush, path);
        }
        else
        {
            using var brush = new SolidBrush(bgStart);
            g.FillPath(brush, path);
        }

        // Draw border if defined
        if (borderColor != Color.Transparent)
        {
            using var pen = new Pen(borderColor, 1.2f);
            g.DrawPath(pen, path);
        }

        // Draw Text and optional Image
        var flags = TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.SingleLine | TextFormatFlags.WordEllipsis;
        TextRenderer.DrawText(g, Text, Font, rect, textColor, flags);
    }
}
