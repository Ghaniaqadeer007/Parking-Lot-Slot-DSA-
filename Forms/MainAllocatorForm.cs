namespace ParkingLotSlotAllocator.Forms;

using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using ParkingLotSlotAllocator.Models;
using ParkingLotSlotAllocator.Services;
using ParkingLotSlotAllocator.UI;

public class MainAllocatorForm : Form
{
    private readonly ParkingLotManager _manager = ParkingLotManager.Instance;
    private int _selectedFloor = 1;

    // UI Controls
    private FlowLayoutPanel _slotsPanel = null!;
    private TextBox _txtPlate = null!;
    private TextBox _txtOwner = null!;
    private ComboBox _cmbType = null!;
    private TextBox _txtCheckout = null!;
    private Label _lblStatusMsg = null!;
    private Label _lblTotalSlots = null!;
    private Label _lblAvailableSlots = null!;
    private Label _lblOccupancyRate = null!;
    private Label _lblRevenue = null!;
    private ListBox _lstWaitingQueue = null!;
    private Button _btnFloor1 = null!;
    private Button _btnFloor2 = null!;

    public MainAllocatorForm()
    {
        Text = "Parking Lot Slot Allocator - Management Dashboard";
        Size = new Size(1260, 820);
        MinimumSize = new Size(1100, 720);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Palette.BackgroundCanvas;
        Font = Palette.FontBody(9.5f);

        InitializeLayout();
        _manager.OnLotUpdated += RefreshAll;
        RefreshAll();
    }

    private void InitializeLayout()
    {
        // 1. Top Navigation Bar
        var topNav = new Panel
        {
            Dock = DockStyle.Top,
            Height = 70,
            BackColor = Palette.SurfaceCard,
            Padding = new Padding(24, 12, 24, 12)
        };
        topNav.Paint += (s, e) =>
        {
            using var borderPen = new Pen(Palette.BorderSubtle, 1f);
            e.Graphics.DrawLine(borderPen, 0, topNav.Height - 1, topNav.Width, topNav.Height - 1);
        };
        Controls.Add(topNav);

        // Back to Cover Button
        var btnBack = new ModernButton
        {
            Text = "← Back to Cover Page",
            ButtonStyle = ModernButtonStyle.Ghost,
            Size = new Size(170, 42),
            Location = new Point(24, 14),
            BorderRadius = 10
        };
        btnBack.Click += (s, e) =>
        {
            Close();
        };
        topNav.Controls.Add(btnBack);

        // Title & Pill
        var lblNavTitle = new Label
        {
            Text = "PARKING LOT SLOT ALLOCATOR",
            Font = Palette.FontDisplay(13f, FontStyle.Bold),
            ForeColor = Palette.DeepBurgundy,
            Location = new Point(210, 16),
            AutoSize = true
        };
        topNav.Controls.Add(lblNavTitle);

        var lblNavSub = new Label
        {
            Text = "DSA Min-Heap & Hash Table Workspace",
            Font = Palette.FontBody(8.5f, FontStyle.Regular),
            ForeColor = Palette.TextMuted,
            Location = new Point(212, 40),
            AutoSize = true
        };
        topNav.Controls.Add(lblNavSub);

        // Undo Button (LIFO Stack)
        var btnUndo = new ModernButton
        {
            Text = "↺ Undo Last Allocation",
            ButtonStyle = ModernButtonStyle.Secondary,
            Size = new Size(190, 42),
            Anchor = AnchorStyles.Top | AnchorStyles.Right,
            Location = new Point(topNav.Width - 360, 14),
            BorderRadius = 10
        };
        btnUndo.Click += (s, e) =>
        {
            var result = _manager.UndoLastAllocation();
            ShowStatusMessage(result.Message, result.Success ? Palette.Success : Palette.Danger);
        };
        topNav.Controls.Add(btnUndo);

        // DSA Specs Button
        var btnDsaSpecs = new ModernButton
        {
            Text = "🧠 DSA Specs",
            ButtonStyle = ModernButtonStyle.Ghost,
            Size = new Size(130, 42),
            Anchor = AnchorStyles.Top | AnchorStyles.Right,
            Location = new Point(topNav.Width - 154, 14),
            BorderRadius = 10
        };
        btnDsaSpecs.Click += (s, e) =>
        {
            using var modal = new DsaModal();
            modal.ShowDialog(this);
        };
        topNav.Controls.Add(btnDsaSpecs);

        // 2. Bottom KPI Bar
        var bottomKpi = new Panel
        {
            Dock = DockStyle.Bottom,
            Height = 65,
            BackColor = Palette.SurfaceCard,
            Padding = new Padding(24, 10, 24, 10)
        };
        bottomKpi.Paint += (s, e) =>
        {
            using var borderPen = new Pen(Palette.BorderSubtle, 1f);
            e.Graphics.DrawLine(borderPen, 0, 0, bottomKpi.Width, 0);
        };
        Controls.Add(bottomKpi);

        var kpiFlow = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.LeftToRight,
            WrapContents = false,
            BackColor = Color.Transparent
        };
        bottomKpi.Controls.Add(kpiFlow);

        _lblTotalSlots = CreateKpiItem(kpiFlow, "TOTAL CAPACITY", "48 Bays", Palette.TextPrimary);
        _lblAvailableSlots = CreateKpiItem(kpiFlow, "AVAILABLE (HEAP)", "43 Free", Palette.Success);
        _lblOccupancyRate = CreateKpiItem(kpiFlow, "OCCUPANCY", "10.4%", Palette.Primary);
        _lblRevenue = CreateKpiItem(kpiFlow, "REVENUE TODAY", "$75.00", Palette.Secondary);

        // Status message label on bottom right
        _lblStatusMsg = new Label
        {
            Text = "Ready • Nearest slot allocation powered by O(log N) Min-Heap",
            Font = Palette.FontBody(9f, FontStyle.Regular),
            ForeColor = Palette.TextSecondary,
            AutoSize = true,
            Margin = new Padding(30, 14, 0, 0)
        };
        kpiFlow.Controls.Add(_lblStatusMsg);

        // 3. Main Center Split Area
        var mainContainer = new SplitContainer
        {
            Dock = DockStyle.Fill,
            Orientation = Orientation.Vertical,
            SplitterDistance = 380,
            SplitterWidth = 8,
            BackColor = Palette.BackgroundCanvas
        };
        Controls.Add(mainContainer);
        mainContainer.BringToFront();

        // Left Sidebar: Allocation & Departure Forms
        BuildSidebar(mainContainer.Panel1);

        // Right View: Floor Map & Slots Grid
        BuildSlotsGridArea(mainContainer.Panel2);
    }

    private Label CreateKpiItem(Control parent, string label, string value, Color valColor)
    {
        var panel = new Panel
        {
            Size = new Size(160, 46),
            Margin = new Padding(0, 0, 20, 0),
            BackColor = Color.Transparent
        };

        var lblSub = new Label
        {
            Text = label,
            Font = Palette.FontBody(7.5f, FontStyle.Bold),
            ForeColor = Palette.TextMuted,
            Location = new Point(0, 2),
            AutoSize = true
        };
        panel.Controls.Add(lblSub);

        var lblVal = new Label
        {
            Text = value,
            Font = Palette.FontDisplay(12f, FontStyle.Bold),
            ForeColor = valColor,
            Location = new Point(0, 18),
            AutoSize = true
        };
        panel.Controls.Add(lblVal);

        parent.Controls.Add(panel);
        return lblVal;
    }

    private void BuildSidebar(Control parent)
    {
        var scrollPanel = new Panel
        {
            Dock = DockStyle.Fill,
            AutoScroll = true,
            Padding = new Padding(20)
        };
        parent.Controls.Add(scrollPanel);

        // Card 1: Allocate Slot Card
        var cardAllocate = new ModernCard
        {
            Size = new Size(340, 310),
            Location = new Point(10, 10),
            CardColor = Palette.SurfaceCard
        };
        scrollPanel.Controls.Add(cardAllocate);

        var lblAllocTitle = new Label
        {
            Text = "✨ Allocate Nearest Slot",
            Font = Palette.FontDisplay(11.5f, FontStyle.Bold),
            ForeColor = Palette.TextPrimary,
            Location = new Point(16, 14),
            AutoSize = true
        };
        cardAllocate.Controls.Add(lblAllocTitle);

        var lblAllocSub = new Label
        {
            Text = "Min-Heap O(log N) finds closest bay to entrance",
            Font = Palette.FontBody(8f),
            ForeColor = Palette.TextSecondary,
            Location = new Point(18, 38),
            AutoSize = true
        };
        cardAllocate.Controls.Add(lblAllocSub);

        // Plate Input
        var lblPlate = new Label { Text = "LICENSE PLATE", Font = Palette.FontBody(8f, FontStyle.Bold), ForeColor = Palette.TextMuted, Location = new Point(18, 68), AutoSize = true };
        cardAllocate.Controls.Add(lblPlate);
        _txtPlate = new TextBox { Location = new Point(18, 88), Width = 300, Font = Palette.FontBody(10f), Text = "TEX-" + new Random().Next(1000, 9999) };
        cardAllocate.Controls.Add(_txtPlate);

        // Owner Input
        var lblOwner = new Label { Text = "OWNER NAME / VISITOR", Font = Palette.FontBody(8f, FontStyle.Bold), ForeColor = Palette.TextMuted, Location = new Point(18, 122), AutoSize = true };
        cardAllocate.Controls.Add(lblOwner);
        _txtOwner = new TextBox { Location = new Point(18, 142), Width = 300, Font = Palette.FontBody(10f), Text = "Jordan Lee" };
        cardAllocate.Controls.Add(_txtOwner);

        // Vehicle Type
        var lblType = new Label { Text = "VEHICLE TYPE", Font = Palette.FontBody(8f, FontStyle.Bold), ForeColor = Palette.TextMuted, Location = new Point(18, 176), AutoSize = true };
        cardAllocate.Controls.Add(lblType);
        _cmbType = new ComboBox { Location = new Point(18, 196), Width = 300, DropDownStyle = ComboBoxStyle.DropDownList, Font = Palette.FontBody(10f) };
        _cmbType.Items.AddRange(Enum.GetNames(typeof(VehicleType)));
        _cmbType.SelectedIndex = 0;
        cardAllocate.Controls.Add(_cmbType);

        // Allocate Button
        var btnAllocate = new ModernButton
        {
            Text = "🚀 Allocate Closest Slot",
            ButtonStyle = ModernButtonStyle.Primary,
            Location = new Point(18, 242),
            Size = new Size(300, 44),
            BorderRadius = 12
        };
        btnAllocate.Click += OnAllocateClicked;
        cardAllocate.Controls.Add(btnAllocate);

        // Card 2: Release / Checkout Card
        var cardCheckout = new ModernCard
        {
            Size = new Size(340, 195),
            Location = new Point(10, 335),
            CardColor = Palette.SurfaceCard
        };
        scrollPanel.Controls.Add(cardCheckout);

        var lblCheckTitle = new Label
        {
            Text = "💳 Vehicle Checkout & Exit",
            Font = Palette.FontDisplay(11.5f, FontStyle.Bold),
            ForeColor = Palette.TextPrimary,
            Location = new Point(16, 14),
            AutoSize = true
        };
        cardCheckout.Controls.Add(lblCheckTitle);

        var lblCheckSub = new Label
        {
            Text = "O(1) Hash Map plate / ticket lookup & fee billing",
            Font = Palette.FontBody(8f),
            ForeColor = Palette.TextSecondary,
            Location = new Point(18, 38),
            AutoSize = true
        };
        cardCheckout.Controls.Add(lblCheckSub);

        var lblSearch = new Label { Text = "PLATE OR TICKET ID", Font = Palette.FontBody(8f, FontStyle.Bold), ForeColor = Palette.TextMuted, Location = new Point(18, 68), AutoSize = true };
        cardCheckout.Controls.Add(lblSearch);
        _txtCheckout = new TextBox { Location = new Point(18, 88), Width = 300, Font = Palette.FontBody(10f), PlaceholderText = "e.g. NYC-4821 or TKT-..." };
        cardCheckout.Controls.Add(_txtCheckout);

        var btnRelease = new ModernButton
        {
            Text = "Exit Vehicle & Generate Bill",
            ButtonStyle = ModernButtonStyle.Secondary,
            Location = new Point(18, 130),
            Size = new Size(300, 44),
            BorderRadius = 12
        };
        btnRelease.Click += OnReleaseClicked;
        cardCheckout.Controls.Add(btnRelease);

        // Card 3: FIFO Waiting Queue
        var cardQueue = new ModernCard
        {
            Size = new Size(340, 170),
            Location = new Point(10, 545),
            CardColor = Palette.SurfaceCard
        };
        scrollPanel.Controls.Add(cardQueue);

        var lblQueueTitle = new Label
        {
            Text = "⏳ Entrance Waiting Queue (FIFO)",
            Font = Palette.FontDisplay(10.5f, FontStyle.Bold),
            ForeColor = Palette.TextPrimary,
            Location = new Point(16, 14),
            AutoSize = true
        };
        cardQueue.Controls.Add(lblQueueTitle);

        _lstWaitingQueue = new ListBox
        {
            Location = new Point(18, 42),
            Size = new Size(300, 100),
            BorderStyle = BorderStyle.None,
            Font = Palette.FontBody(8.5f),
            BackColor = Palette.BackgroundSubtle
        };
        cardQueue.Controls.Add(_lstWaitingQueue);
    }

    private void BuildSlotsGridArea(Control parent)
    {
        var mainRight = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(16)
        };
        parent.Controls.Add(mainRight);

        // Floor selector and legend toolbar
        var toolbar = new Panel
        {
            Dock = DockStyle.Top,
            Height = 52,
            BackColor = Color.Transparent
        };
        mainRight.Controls.Add(toolbar);

        _btnFloor1 = new Button
        {
            Text = "Floor 1 (Sections A & B)",
            Font = Palette.FontBody(9.5f, FontStyle.Bold),
            Size = new Size(170, 38),
            Location = new Point(0, 6),
            FlatStyle = FlatStyle.Flat,
            BackColor = Palette.Primary,
            ForeColor = Palette.TextWhite,
            Cursor = Cursors.Hand
        };
        _btnFloor1.FlatAppearance.BorderSize = 0;
        _btnFloor1.Click += (s, e) => SwitchFloor(1);
        toolbar.Controls.Add(_btnFloor1);

        _btnFloor2 = new Button
        {
            Text = "Floor 2 (Sections C & D)",
            Font = Palette.FontBody(9.5f, FontStyle.Bold),
            Size = new Size(170, 38),
            Location = new Point(180, 6),
            FlatStyle = FlatStyle.Flat,
            BackColor = Palette.SurfaceCard,
            ForeColor = Palette.TextSecondary,
            Cursor = Cursors.Hand
        };
        _btnFloor2.FlatAppearance.BorderSize = 0;
        _btnFloor2.Click += (s, e) => SwitchFloor(2);
        toolbar.Controls.Add(_btnFloor2);

        // Legend Pills
        AddLegendPill(toolbar, "● Available", Palette.Success, toolbar.Width - 340);
        AddLegendPill(toolbar, "● Occupied", Palette.TextMuted, toolbar.Width - 240);
        AddLegendPill(toolbar, "● EV Bay", Palette.EVColor, toolbar.Width - 150);
        AddLegendPill(toolbar, "● VIP Bay", Palette.Warning, toolbar.Width - 65);

        // Slots Grid Panel
        _slotsPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            AutoScroll = true,
            Padding = new Padding(0, 10, 0, 10),
            BackColor = Color.Transparent
        };
        mainRight.Controls.Add(_slotsPanel);
        _slotsPanel.BringToFront();
    }

    private void AddLegendPill(Control parent, string text, Color color, int x)
    {
        var lbl = new Label
        {
            Text = text,
            Font = Palette.FontBody(8.5f, FontStyle.Bold),
            ForeColor = color,
            Location = new Point(x, 14),
            AutoSize = true,
            Anchor = AnchorStyles.Top | AnchorStyles.Right
        };
        parent.Controls.Add(lbl);
    }

    private void SwitchFloor(int floor)
    {
        _selectedFloor = floor;
        if (floor == 1)
        {
            _btnFloor1.BackColor = Palette.Primary;
            _btnFloor1.ForeColor = Palette.TextWhite;
            _btnFloor2.BackColor = Palette.SurfaceCard;
            _btnFloor2.ForeColor = Palette.TextSecondary;
        }
        else
        {
            _btnFloor2.BackColor = Palette.Primary;
            _btnFloor2.ForeColor = Palette.TextWhite;
            _btnFloor1.BackColor = Palette.SurfaceCard;
            _btnFloor1.ForeColor = Palette.TextSecondary;
        }
        RenderSlots();
    }

    private void OnAllocateClicked(object? sender, EventArgs e)
    {
        string plate = _txtPlate.Text.Trim();
        string owner = _txtOwner.Text.Trim();
        if (string.IsNullOrEmpty(plate))
        {
            ShowStatusMessage("Please enter a valid license plate number.", Palette.Danger);
            return;
        }

        var type = Enum.Parse<VehicleType>(_cmbType.SelectedItem?.ToString() ?? "Sedan");
        var vehicle = new Vehicle(plate, type, "Modern Slate", string.IsNullOrEmpty(owner) ? "Visitor" : owner);

        var result = _manager.AllocateSlot(vehicle);
        if (result.Success && result.Slot != null && result.Ticket != null)
        {
            ShowStatusMessage($"Successfully allocated Slot {result.Slot.SlotId}! Ticket: {result.Ticket.TicketId}", Palette.Success);
            _txtPlate.Text = "TEX-" + new Random().Next(1000, 9999);
        }
        else
        {
            ShowStatusMessage(result.Message, Palette.Danger);
        }
    }

    private void OnReleaseClicked(object? sender, EventArgs e)
    {
        string query = _txtCheckout.Text.Trim();
        if (string.IsNullOrEmpty(query))
        {
            ShowStatusMessage("Please enter a license plate or ticket number to release.", Palette.Danger);
            return;
        }

        var result = _manager.ReleaseSlot(query);
        if (result.Success && result.Ticket != null)
        {
            ShowStatusMessage($"Vehicle departed! Slot freed. Fee collected: ${result.Ticket.TotalAmount:F2}.", Palette.Success);
            _txtCheckout.Clear();
        }
        else
        {
            ShowStatusMessage(result.Message, Palette.Danger);
        }
    }

    private void RefreshAll()
    {
        if (InvokeRequired)
        {
            BeginInvoke(RefreshAll);
            return;
        }

        _lblTotalSlots.Text = $"{_manager.TotalSlotsCount} Bays";
        _lblAvailableSlots.Text = $"{_manager.AvailableSlotsCount} Free";
        _lblOccupancyRate.Text = $"{_manager.OccupancyPercentage:F1}%";
        _lblRevenue.Text = $"${_manager.TotalRevenue:F2}";

        // Update queue list
        _lstWaitingQueue.Items.Clear();
        var queueItems = _manager.EntranceQueue.ToList();
        if (queueItems.Count == 0)
        {
            _lstWaitingQueue.Items.Add("  No vehicles waiting in buffer");
        }
        else
        {
            int pos = 1;
            foreach (var v in queueItems)
            {
                _lstWaitingQueue.Items.Add($"  #{pos++} - {v.LicensePlate} ({v.Type})");
            }
        }

        RenderSlots();
    }

    private void RenderSlots()
    {
        _slotsPanel.SuspendLayout();
        _slotsPanel.Controls.Clear();

        var slotsOnFloor = _manager.AllSlots.Where(s => s.Floor == _selectedFloor).ToList();

        foreach (var slot in slotsOnFloor)
        {
            _slotsPanel.Controls.Add(CreateSlotCard(slot));
        }

        _slotsPanel.ResumeLayout();
    }

    private Control CreateSlotCard(ParkingSlot slot)
    {
        var card = new Panel
        {
            Size = new Size(152, 115),
            Margin = new Padding(8),
            BackColor = Palette.SurfaceCard,
            Cursor = Cursors.Hand
        };

        card.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            var rect = new Rectangle(0, 0, card.Width - 1, card.Height - 1);
            using var path = Palette.CreateRoundedRectangle(rect, 10);

            Color bgColor = slot.IsAvailable
                ? (slot.Type == SlotType.ElectricVehicle ? Palette.EVLight : Palette.SuccessLight)
                : Color.FromArgb(248, 250, 252);

            Color borderColor = slot.IsAvailable
                ? (slot.Type == SlotType.ElectricVehicle ? Color.FromArgb(186, 230, 253) : Palette.SuccessBorder)
                : Palette.BorderSubtle;

            using var brush = new SolidBrush(bgColor);
            g.FillPath(brush, path);

            using var pen = new Pen(borderColor, 1.2f);
            g.DrawPath(pen, path);

            // LED Status Dot
            Color led = slot.IsAvailable ? Palette.Success : Palette.TextMuted;
            using var ledBrush = new SolidBrush(led);
            g.FillEllipse(ledBrush, 12, 12, 8, 8);

            // Slot ID
            using var idFont = Palette.FontDisplay(10f, FontStyle.Bold);
            using var idBrush = new SolidBrush(Palette.TextPrimary);
            g.DrawString(slot.SlotId, idFont, idBrush, 26, 8);

            // Type Pill
            string typeBadge = slot.Type switch
            {
                SlotType.ElectricVehicle => "⚡ EV",
                SlotType.VIP => "★ VIP",
                SlotType.Handicap => "♿ Accessible",
                SlotType.Compact => "Compact",
                _ => "Standard"
            };
            using var typeFont = Palette.FontBody(7.5f, FontStyle.Bold);
            using var typeBrush = new SolidBrush(slot.Type == SlotType.ElectricVehicle ? Palette.EVColor : Palette.TextMuted);
            g.DrawString(typeBadge, typeFont, typeBrush, 12, 32);

            // Distance / Info
            using var distFont = Palette.FontBody(7.5f, FontStyle.Regular);
            using var distBrush = new SolidBrush(Palette.TextSecondary);
            g.DrawString($"Dist: {slot.DistanceFromEntrance:F1}m • ${slot.HourlyRate}/h", distFont, distBrush, 12, 50);

            // Vehicle or Available Status
            if (slot.CurrentVehicle != null)
            {
                using var carFont = Palette.FontDisplay(8.5f, FontStyle.Bold);
                using var carBrush = new SolidBrush(Palette.Primary);
                g.DrawString($"🚗 {slot.CurrentVehicle.LicensePlate}", carFont, carBrush, 12, 74);

                using var ownerFont = Palette.FontBody(7.2f, FontStyle.Regular);
                using var ownerBrush = new SolidBrush(Palette.TextSecondary);
                g.DrawString(slot.CurrentVehicle.OwnerName, ownerFont, ownerBrush, 12, 92);
            }
            else
            {
                using var availFont = Palette.FontBody(8f, FontStyle.Bold);
                using var availBrush = new SolidBrush(Palette.Success);
                g.DrawString("✓ AVAILABLE", availFont, availBrush, 12, 82);
            }
        };

        card.Click += (s, e) =>
        {
            if (slot.CurrentVehicle != null)
            {
                _txtCheckout.Text = slot.CurrentVehicle.LicensePlate;
                ShowStatusMessage($"Selected Slot {slot.SlotId} (Vehicle: {slot.CurrentVehicle.LicensePlate}) for Checkout.", Palette.Primary);
            }
            else
            {
                ShowStatusMessage($"Slot {slot.SlotId} is available (Distance: {slot.DistanceFromEntrance:F1}m). Ready for allocation.", Palette.Success);
            }
        };

        return card;
    }

    private void ShowStatusMessage(string msg, Color color)
    {
        _lblStatusMsg.Text = msg;
        _lblStatusMsg.ForeColor = color;
    }
}
