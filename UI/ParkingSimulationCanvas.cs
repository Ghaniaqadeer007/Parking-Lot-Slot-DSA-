namespace ParkingLotSlotAllocator.UI;

using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

public class ParkingSimulationCanvas : UserControl
{
    private readonly System.Windows.Forms.Timer _animTimer;
    private float _time = 0f;
    private int _step = 0;

    // Simulation car state
    private float _carX = -60f;
    private float _carY = 160f;
    private float _carAngle = 0f;
    private float _gateAngle = 0f; // 0 = closed, -70 = open
    private int _targetSlot = 2;   // 0 to 5
    private string _currentPlate = "DSA-2026";
    private Color _carColor = Palette.DeepBurgundy; // Deep Burgundy from user theme
    private string _statusMessage = "Nearest Slot Search via Min-Heap: Slot A-03 (18.5m)";
    private float _pulseRadius = 0f;
    private bool _showPulse = false;

    // Ambient floating particles
    private readonly List<PointF> _particles = new();
    private readonly List<float> _particleSpeeds = new();
    private readonly Random _rand = new();

    // Slot definitions for the visual canvas
    private class SimSlot
    {
        public string Name { get; set; } = "";
        public Rectangle Bounds { get; set; }
        public bool IsOccupied { get; set; }
        public Color ParkedCarColor { get; set; }
        public string Plate { get; set; } = "";
        public bool IsEV { get; set; }
    }

    private readonly List<SimSlot> _simSlots = new();

    public ParkingSimulationCanvas()
    {
        SetStyle(ControlStyles.AllPaintingInWmPaint |
                 ControlStyles.UserPaint |
                 ControlStyles.OptimizedDoubleBuffer |
                 ControlStyles.ResizeRedraw, true);

        BackColor = Palette.SurfaceCard;
        DoubleBuffered = true;

        InitializeParticles();
        InitializeSimSlots();

        _animTimer = new System.Windows.Forms.Timer { Interval = 20 }; // ~50 fps
        _animTimer.Tick += OnAnimTick;

        bool isDesign = LicenseManager.UsageMode == LicenseUsageMode.Designtime;
        if (!isDesign)
        {
            _animTimer.Start();
        }
        else
        {
            _carX = 220f;
            _carY = 160f;
            _carAngle = 0f;
            _statusMessage = "Min-Heap Nearest Slot Engine: Active & Ready";
        }
    }

    private void InitializeParticles()
    {
        for (int i = 0; i < 20; i++)
        {
            _particles.Add(new PointF(_rand.Next(0, 600), _rand.Next(0, 360)));
            _particleSpeeds.Add(0.3f + (float)_rand.NextDouble() * 0.7f);
        }
    }

    private void InitializeSimSlots()
    {
        _simSlots.Clear();
        // Row 1 (Top row: Slots A-01, A-02, A-03)
        _simSlots.Add(new SimSlot { Name = "A-01", Bounds = new Rectangle(140, 30, 80, 52), IsOccupied = true, ParkedCarColor = Palette.CosmicLatte, Plate = "CA-102" });
        _simSlots.Add(new SimSlot { Name = "A-02", Bounds = new Rectangle(240, 30, 80, 52), IsOccupied = false, IsEV = true });
        _simSlots.Add(new SimSlot { Name = "A-03", Bounds = new Rectangle(340, 30, 80, 52), IsOccupied = false });

        // Row 2 (Bottom row: Slots B-01, B-02, B-03)
        _simSlots.Add(new SimSlot { Name = "B-01", Bounds = new Rectangle(140, 240, 80, 52), IsOccupied = false });
        _simSlots.Add(new SimSlot { Name = "B-02", Bounds = new Rectangle(240, 240, 80, 52), IsOccupied = true, ParkedCarColor = Color.FromArgb(92, 36, 43), Plate = "NY-884" });
        _simSlots.Add(new SimSlot { Name = "B-03", Bounds = new Rectangle(340, 240, 80, 52), IsOccupied = false, IsEV = true });
    }

    private void OnAnimTick(object? sender, EventArgs e)
    {
        _time += 0.03f;

        // Update ambient particles
        for (int i = 0; i < _particles.Count; i++)
        {
            float y = _particles[i].Y - _particleSpeeds[i];
            float x = _particles[i].X - (_particleSpeeds[i] * 0.2f);
            if (y < 0) { y = Height; x = _rand.Next(0, Width); }
            if (x < 0) { x = Width; }
            _particles[i] = new PointF(x, y);
        }

        // Pulse beacon animation
        if (_showPulse)
        {
            _pulseRadius += 1.2f;
            if (_pulseRadius > 35f) _pulseRadius = 0f;
        }

        // Simulation State Machine
        switch (_step)
        {
            case 0: // Approach entrance barrier
                _statusMessage = "Vehicle Approaching Entrance Gate...";
                _carX += 2.8f;
                _carY = 160f;
                _carAngle = 0f;
                _showPulse = false;
                if (_carX >= 65f)
                {
                    _step = 1;
                    _time = 0f;
                }
                break;

            case 1: // Gate opening & ticket generation
                _statusMessage = "Min-Heap ExtractMin() -> Target: " + _simSlots[_targetSlot].Name + " (Distance: 16.5m)";
                if (_gateAngle > -75f) _gateAngle -= 3f;
                if (_time > 1.2f)
                {
                    _step = 2;
                }
                break;

            case 2: // Drive along central aisle towards slot
                _statusMessage = "Navigating aisle towards " + _simSlots[_targetSlot].Name + "...";
                if (_gateAngle < 0f) _gateAngle += 2f; // Gate closes behind
                float targetTurnX = _simSlots[_targetSlot].Bounds.X + 15;
                if (_carX < targetTurnX)
                {
                    _carX += 3.2f;
                }
                else
                {
                    _step = 3;
                }
                break;

            case 3: // Turn and steer into slot
                _statusMessage = "Steering into " + _simSlots[_targetSlot].Name + "...";
                float slotCenterY = _targetSlot < 3 ? _simSlots[_targetSlot].Bounds.Y + 26 : _simSlots[_targetSlot].Bounds.Y + 26;
                bool isTop = _targetSlot < 3;

                if (isTop)
                {
                    if (_carAngle > -90f) _carAngle -= 6f;
                    if (_carY > slotCenterY) _carY -= 2.4f;
                    else _step = 4;
                }
                else
                {
                    if (_carAngle < 90f) _carAngle += 6f;
                    if (_carY < slotCenterY) _carY += 2.4f;
                    else _step = 4;
                }

                if (_step == 4)
                {
                    _time = 0f;
                    _showPulse = true;
                    _simSlots[_targetSlot].IsOccupied = true;
                    _simSlots[_targetSlot].ParkedCarColor = _carColor;
                    _simSlots[_targetSlot].Plate = _currentPlate;
                }
                break;

            case 4: // Parked state, show success beacon
                _statusMessage = $"Parked in {_simSlots[_targetSlot].Name}! O(1) Hash Map registration complete.";
                if (_time > 4.0f)
                {
                    // Reset or pick next slot
                    _simSlots[_targetSlot].IsOccupied = false;
                    _targetSlot = (_targetSlot == 2) ? 1 : (_targetSlot == 1 ? 5 : 2);
                    _carX = -60f;
                    _carY = 160f;
                    _carAngle = 0f;
                    _gateAngle = 0f;
                    _showPulse = false;
                    _currentPlate = "DSA-" + _rand.Next(1000, 9999);
                    _carColor = _targetSlot switch
                    {
                        1 => Palette.Success,
                        5 => Palette.CosmicLatte,
                        _ => Palette.DeepBurgundy
                    };
                    _step = 0;
                    _time = 0f;
                }
                break;
        }

        Invalidate();
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        // Background subtle grid
        DrawModernBackground(g);

        // Draw Driving Asphalt Lane
        DrawDriveway(g);

        // Draw Slots
        DrawSlots(g);

        // Draw Entrance Gate
        DrawEntranceGate(g);

        // Draw Moving Vehicle
        DrawCar(g, _carX, _carY, _carAngle, _carColor, _currentPlate);

        // Draw HUD Overlay (Status Pill & Complexity Badge)
        DrawHud(g);
    }

    private void DrawModernBackground(Graphics g)
    {
        using var bgBrush = new SolidBrush(Palette.SurfaceCard);
        g.FillRectangle(bgBrush, ClientRectangle);

        // Soft dot grid in warm Cosmic Latte tint
        using var dotBrush = new SolidBrush(Color.FromArgb(28, Palette.CosmicLatte));
        for (int x = 20; x < Width; x += 32)
        {
            for (int y = 20; y < Height; y += 32)
            {
                g.FillEllipse(dotBrush, x, y, 2.5f, 2.5f);
            }
        }

        // Ambient particles in warm mocha tone
        using var particleBrush = new SolidBrush(Color.FromArgb(40, Palette.CosmicLatte));
        foreach (var p in _particles)
        {
            g.FillEllipse(particleBrush, p.X, p.Y, 3f, 3f);
        }
    }

    private void DrawDriveway(Graphics g)
    {
        var roadRect = new Rectangle(0, 110, Width, 100);
        using var roadBrush = new SolidBrush(Palette.BackgroundSubtle); // Clean warm stone road
        g.FillRectangle(roadBrush, roadRect);

        // Border lines in Mocha Cream
        using var roadBorderPen = new Pen(Palette.BorderSubtle, 1.5f);
        g.DrawLine(roadBorderPen, 0, 110, Width, 110);
        g.DrawLine(roadBorderPen, 0, 210, Width, 210);

        // Dashed center divider line in Cosmic Latte
        using var centerPen = new Pen(Palette.CosmicLatte, 2f);
        centerPen.DashStyle = DashStyle.Dash;
        centerPen.DashPattern = new float[] { 6f, 4f };
        g.DrawLine(centerPen, 0, 160, Width, 160);

        // Directional arrows
        DrawRoadArrow(g, 110, 160);
        DrawRoadArrow(g, 280, 160);
        DrawRoadArrow(g, 430, 160);
    }

    private void DrawRoadArrow(Graphics g, float x, float y)
    {
        using var pen = new Pen(Palette.CosmicLatte, 2f);
        g.DrawLine(pen, x - 12, y, x + 10, y);
        g.DrawLine(pen, x + 4, y - 5, x + 10, y);
        g.DrawLine(pen, x + 4, y + 5, x + 10, y);
    }

    private void DrawSlots(Graphics g)
    {
        foreach (var slot in _simSlots)
        {
            var rect = slot.Bounds;

            // Slot base background
            Color slotBg = slot.IsOccupied ? Color.FromArgb(248, 250, 252) : (slot.IsEV ? Palette.EVLight : Palette.SuccessLight);
            Color slotBorder = slot.IsOccupied ? Palette.BorderSubtle : (slot.IsEV ? Color.FromArgb(125, 211, 252) : Palette.SuccessBorder);

            using var path = Palette.CreateRoundedRectangle(rect, 8);
            using var brush = new SolidBrush(slotBg);
            g.FillPath(brush, path);

            using var pen = new Pen(slotBorder, 1.5f);
            g.DrawPath(pen, path);

            // LED Occupancy Indicator dot
            Color ledColor = slot.IsOccupied ? Palette.Danger : Palette.Success;
            using var ledBrush = new SolidBrush(ledColor);
            g.FillEllipse(ledBrush, rect.X + 8, rect.Y + 8, 8, 8);

            // Slot Name & Badge
            using var nameFont = Palette.FontDisplay(8.5f, FontStyle.Bold);
            using var textBrush = new SolidBrush(Palette.TextPrimary);
            g.DrawString(slot.Name, nameFont, textBrush, rect.X + 20, rect.Y + 5);

            if (slot.IsEV)
            {
                using var evFont = Palette.FontBody(7.5f, FontStyle.Bold);
                using var evBrush = new SolidBrush(Palette.EVColor);
                g.DrawString("⚡ EV", evFont, evBrush, rect.X + 46, rect.Y + 6);
            }

            // If occupied and not our active moving car, draw parked car
            if (slot.IsOccupied && (_step != 3 || _simSlots[_targetSlot] != slot))
            {
                float carCenterX = rect.X + (rect.Width / 2f);
                float carCenterY = rect.Y + (rect.Height / 2f) + 4;
                float angle = rect.Y < 120 ? -90f : 90f;
                DrawCar(g, carCenterX, carCenterY, angle, slot.ParkedCarColor, slot.Plate);
            }

            // Pulsing circle around target slot
            if (_showPulse && _simSlots[_targetSlot] == slot)
            {
                float cx = rect.X + (rect.Width / 2f);
                float cy = rect.Y + (rect.Height / 2f);
                using var pulsePen = new Pen(Color.FromArgb((int)Math.Max(10, 255 - (_pulseRadius * 7)), Palette.Success), 2f);
                g.DrawEllipse(pulsePen, cx - _pulseRadius, cy - _pulseRadius, _pulseRadius * 2, _pulseRadius * 2);
            }
        }
    }

    private void DrawEntranceGate(Graphics g)
    {
        // Gate booth
        var boothRect = new Rectangle(75, 90, 16, 20);
        using var boothBrush = new SolidBrush(Palette.Primary);
        g.FillRectangle(boothBrush, boothRect);

        // Barrier arm
        var state = g.Save();
        g.TranslateTransform(83, 110);
        g.RotateTransform(_gateAngle);

        using var armPen = new Pen(Palette.Warning, 4f);
        g.DrawLine(armPen, 0, 0, 0, 48);
        using var stripePen = new Pen(Palette.TextWhite, 4f);
        stripePen.DashStyle = DashStyle.Dash;
        stripePen.DashPattern = new float[] { 2f, 2f };
        g.DrawLine(stripePen, 0, 0, 0, 48);

        g.Restore(state);
    }

    private void DrawCar(Graphics g, float cx, float cy, float angle, Color bodyColor, string plate)
    {
        var state = g.Save();
        g.TranslateTransform(cx, cy);
        g.RotateTransform(angle);

        int carW = 48;
        int carH = 24;
        var carRect = new Rectangle(-carW / 2, -carH / 2, carW, carH);

        // Car Shadow
        using var shadowPath = Palette.CreateRoundedRectangle(new Rectangle(carRect.X + 1, carRect.Y + 2, carW, carH), 6);
        using var shadowBrush = new SolidBrush(Color.FromArgb(40, 15, 23, 42));
        g.FillPath(shadowBrush, shadowPath);

        // Car Body
        using var bodyPath = Palette.CreateRoundedRectangle(carRect, 6);
        using var bodyBrush = new SolidBrush(bodyColor);
        g.FillPath(bodyBrush, bodyPath);

        // Windshield
        var windshield = new Rectangle(carRect.X + 14, carRect.Y + 3, 16, carH - 6);
        using var windPath = Palette.CreateRoundedRectangle(windshield, 4);
        using var windBrush = new SolidBrush(Color.FromArgb(224, 242, 254));
        g.FillPath(windBrush, windPath);

        // Headlights (glow)
        using var lightBrush = new SolidBrush(Color.FromArgb(254, 240, 138));
        g.FillRectangle(lightBrush, carRect.Right - 3, carRect.Y + 2, 3, 4);
        g.FillRectangle(lightBrush, carRect.Right - 3, carRect.Bottom - 6, 3, 4);

        // Taillights
        using var tailBrush = new SolidBrush(Palette.Danger);
        g.FillRectangle(tailBrush, carRect.Left, carRect.Y + 2, 2, 4);
        g.FillRectangle(tailBrush, carRect.Left, carRect.Bottom - 6, 2, 4);

        // License Plate text
        using var plateFont = Palette.FontBody(6.5f, FontStyle.Bold);
        using var plateBrush = new SolidBrush(Palette.TextWhite);
        var textRect = new Rectangle(carRect.X, carRect.Y + 6, carW, 12);
        var flags = TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.SingleLine;
        TextRenderer.DrawText(g, plate, plateFont, textRect, Palette.TextWhite, flags);

        g.Restore(state);
    }

    private void DrawHud(Graphics g)
    {
        // Top Left Status Badge
        var badgeRect = new Rectangle(14, 12, 136, 26);
        using var badgePath = Palette.CreateRoundedRectangle(badgeRect, 13);
        using var badgeBg = new SolidBrush(Color.FromArgb(238, 242, 255));
        g.FillPath(badgeBg, badgePath);
        using var badgePen = new Pen(Palette.PrimaryBorder, 1f);
        g.DrawPath(badgePen, badgePath);

        // Pulsing green live indicator
        using var dotBrush = new SolidBrush(Palette.Success);
        g.FillEllipse(dotBrush, 24, 20, 8, 8);
        using var dotText = Palette.FontBody(7.8f, FontStyle.Bold);
        using var txtBrush = new SolidBrush(Palette.Primary);
        g.DrawString("LIVE SIMULATION", dotText, txtBrush, 36, 17);

        // Bottom Status Message Ticker
        var tickerRect = new Rectangle(14, Height - 36, Width - 28, 28);
        using var tickerPath = Palette.CreateRoundedRectangle(tickerRect, 8);
        using var tickerBg = new SolidBrush(Color.FromArgb(241, 245, 249));
        g.FillPath(tickerBg, tickerPath);
        using var tickerPen = new Pen(Palette.BorderSubtle, 1f);
        g.DrawPath(tickerPen, tickerPath);

        using var tickerFont = Palette.FontBody(8f, FontStyle.Regular);
        using var tickerTextBrush = new SolidBrush(Palette.TextSecondary);
        using var iconFont = Palette.FontDisplay(8.5f, FontStyle.Bold);
        using var iconBrush = new SolidBrush(Palette.Primary);

        g.DrawString("⚡", iconFont, iconBrush, 24, Height - 31);
        g.DrawString(_statusMessage, tickerFont, tickerTextBrush, 44, Height - 29);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _animTimer.Stop();
            _animTimer.Dispose();
        }
        base.Dispose(disposing);
    }
}
