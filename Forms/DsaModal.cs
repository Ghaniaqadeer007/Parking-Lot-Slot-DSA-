namespace ParkingLotSlotAllocator.Forms;

using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using ParkingLotSlotAllocator.UI;

public class DsaModal : Form
{
    public DsaModal()
    {
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.CenterParent;
        Size = new Size(720, 560);
        BackColor = Palette.BackgroundCanvas;
        ShowInTaskbar = false;

        InitializeModalComponents();
    }

    private void InitializeModalComponents()
    {
        // Container Card
        var mainCard = new ModernCard
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(28),
            CardColor = Palette.SurfaceCard,
            BorderColor = Palette.BorderSubtle,
            ShowShadow = false
        };
        Controls.Add(mainCard);

        // Header Panel
        var headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 70,
            BackColor = Color.Transparent
        };
        mainCard.Controls.Add(headerPanel);

        var titleLabel = new Label
        {
            Text = "Data Structures & Algorithms Architecture",
            Font = Palette.FontDisplay(15f, FontStyle.Bold),
            ForeColor = Palette.DeepBurgundy,
            Location = new Point(0, 4),
            AutoSize = true
        };
        headerPanel.Controls.Add(titleLabel);

        var subLabel = new Label
        {
            Text = "Engineered with optimal time & space complexities for real-time slot allocation",
            Font = Palette.FontBody(9.5f, FontStyle.Regular),
            ForeColor = Palette.TextSecondary,
            Location = new Point(0, 34),
            AutoSize = true
        };
        headerPanel.Controls.Add(subLabel);

        // Close Button
        var closeBtn = new ModernButton
        {
            Text = "✕",
            Font = Palette.FontBody(10f, FontStyle.Bold),
            Size = new Size(36, 36),
            Location = new Point(mainCard.Width - 92, 10),
            ButtonStyle = ModernButtonStyle.Ghost,
            BorderRadius = 18
        };
        closeBtn.Click += (s, e) => Close();
        headerPanel.Controls.Add(closeBtn);

        // Content FlowLayoutPanel
        var flow = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            AutoScroll = true,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            Padding = new Padding(0, 10, 0, 0),
            BackColor = Color.Transparent
        };
        mainCard.Controls.Add(flow);
        flow.BringToFront();

        // 4 DSA Cards
        flow.Controls.Add(CreateDsaCard(
            "1. Min-Heap Priority Queue",
            "O(log N) Insert & ExtractMin • O(1) Peek",
            "Allocates the closest parking slot relative to the entrance gate in real time. All available slots are organized in a binary min-heap keyed by Euclidean distance.",
            Palette.DeepBurgundy,
            Palette.MochaCream
        ));

        flow.Controls.Add(CreateDsaCard(
            "2. Hash Map (Dictionary)",
            "O(1) Average Search, Insert & Deletion",
            "Enables instantaneous vehicle and parking ticket resolution by license plate number and alphanumeric ticket ID without linear scanning.",
            Palette.DeepBurgundy,
            Palette.MochaCream
        ));

        flow.Controls.Add(CreateDsaCard(
            "3. FIFO Waiting Queue (First-In, First-Out)",
            "O(1) Enqueue & Dequeue",
            "Buffers arriving vehicles when all preferred slots are occupied. Automatically dispatches the next waiting vehicle the instant a slot is vacated.",
            Palette.Success,
            Palette.SuccessLight
        ));

        flow.Controls.Add(CreateDsaCard(
            "4. LIFO Transaction Stack (Last-In, First-Out)",
            "O(1) Push & Pop",
            "Maintains an immutable undo audit log of recent slot allocations, permitting 1-click rollback of mistakenly allocated vehicles.",
            Palette.Warning,
            Palette.WarningLight
        ));
    }

    private Control CreateDsaCard(string title, string complexity, string description, Color accent, Color bgTint)
    {
        var panel = new Panel
        {
            Size = new Size(640, 94),
            Margin = new Padding(0, 0, 0, 12),
            BackColor = Color.White
        };

        panel.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            var rect = new Rectangle(0, 0, panel.Width - 1, panel.Height - 1);
            using var path = Palette.CreateRoundedRectangle(rect, 10);
            using var bgBrush = new SolidBrush(Color.White);
            g.FillPath(bgBrush, path);

            // Left accent border bar
            using var accentBrush = new SolidBrush(accent);
            g.FillRectangle(accentBrush, 0, 8, 4, panel.Height - 16);

            using var pen = new Pen(Palette.BorderSubtle, 1f);
            g.DrawPath(pen, path);
        };

        var titleLbl = new Label
        {
            Text = title,
            Font = Palette.FontDisplay(10.5f, FontStyle.Bold),
            ForeColor = Palette.TextPrimary,
            Location = new Point(16, 12),
            AutoSize = true
        };
        panel.Controls.Add(titleLbl);

        var badgeLbl = new Label
        {
            Text = complexity,
            Font = Palette.FontBody(8.5f, FontStyle.Bold),
            ForeColor = accent,
            BackColor = bgTint,
            Location = new Point(360, 12),
            Padding = new Padding(6, 2, 6, 2),
            AutoSize = true
        };
        panel.Controls.Add(badgeLbl);

        var descLbl = new Label
        {
            Text = description,
            Font = Palette.FontBody(8.8f, FontStyle.Regular),
            ForeColor = Palette.TextSecondary,
            Location = new Point(16, 42),
            Size = new Size(605, 42)
        };
        panel.Controls.Add(descLbl);

        return panel;
    }
}
