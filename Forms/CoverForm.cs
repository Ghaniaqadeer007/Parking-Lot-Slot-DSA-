namespace ParkingLotSlotAllocator.Forms;

using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using ParkingLotSlotAllocator.Models;
using ParkingLotSlotAllocator.Services;
using ParkingLotSlotAllocator.UI;

public partial class CoverForm : Form
{
    // Windows API for smooth window drag
    public const int WM_NCLBUTTONDOWN = 0xA1;
    public const int HT_CAPTION = 0x2;

    [DllImport("user32.dll")]
    public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

    [DllImport("user32.dll")]
    public static extern bool ReleaseCapture();

    private readonly ParkingLotManager _manager = ParkingLotManager.Instance;
    private System.Windows.Forms.Timer? _fadeInTimer;
    private System.Windows.Forms.Timer? _ambientTimer;
    private float _ambientOffset = 0f;

    public CoverForm()
    {
        InitializeComponent();
        AttachEvents();

        bool isDesign = LicenseManager.UsageMode == LicenseUsageMode.Designtime;
        if (!isDesign)
        {
            Opacity = 0.05;

            // Smooth entrance fade-in animation
            _fadeInTimer = new System.Windows.Forms.Timer { Interval = 15 };
            _fadeInTimer.Tick += (s, e) =>
            {
                if (Opacity < 0.99)
                {
                    Opacity += 0.05;
                }
                else
                {
                    Opacity = 1.0;
                    _fadeInTimer?.Stop();
                }
            };
            _fadeInTimer.Start();

            // Ambient gentle pulse timer
            _ambientTimer = new System.Windows.Forms.Timer { Interval = 40 };
            _ambientTimer.Tick += (s, e) =>
            {
                _ambientOffset += 0.04f;
                Invalidate();
            };
            _ambientTimer.Start();

            _manager.OnLotUpdated += UpdateStats;
            UpdateStats();

            InitializeWarpTextHeading();
        }
        else
        {
            Opacity = 1.0;
        }
    }

    private void AttachEvents()
    {
        // Window Control Buttons
        btnClose.Click += (s, e) => Application.Exit();
        btnMin.Click += (s, e) => WindowState = FormWindowState.Minimized;

        // Title Bar Dragging
        panelTopBar.MouseDown += OnTitleBarMouseDown;
        panelLogo.MouseDown += OnTitleBarMouseDown;
        lblBrand.MouseDown += OnTitleBarMouseDown;
        lblBrandSub.MouseDown += OnTitleBarMouseDown;
        panelStatusPill.MouseDown += OnTitleBarMouseDown;

        // Custom Paint for Badges
        panelLogo.Paint += OnLogoPaint;
        panelStatusPill.Paint += OnStatusPillPaint;
        panelTagPill.Paint += OnTagPillPaint;

        // Action Buttons
        btnLaunch.Click += (s, e) => OpenDashboard();
        btnOpenDashboard.Click += (s, e) => OpenDashboard();

        btnDsa.Click += (s, e) =>
        {
            using var modal = new DsaModal();
            modal.ShowDialog(this);
        };

        btnQuickSim.Click += (s, e) =>
        {
            var rand = new Random();
            var plate = "SIM-" + rand.Next(100, 999);
            var v = new Vehicle(plate, VehicleType.Electric, "Aqua Glow", "Simulated Driver");
            var res = _manager.AllocateSlot(v);
            MessageBox.Show(this, res.Message, "Simulation Event", MessageBoxButtons.OK, MessageBoxIcon.Information);
        };
    }

    private void OpenDashboard()
    {
        var mainForm = new MainAllocatorForm();
        mainForm.FormClosed += (sender, args) => Show();
        Hide();
        mainForm.Show();
    }

    private void OnLogoPaint(object? sender, PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        using var path = Palette.CreateRoundedRectangle(new Rectangle(0, 0, 39, 39), 10);
        using var brush = new LinearGradientBrush(new Rectangle(0, 0, 40, 40), Palette.DeepBurgundy, Palette.PrimaryHover, 45f);
        g.FillPath(brush, path);
    }

    private void OnStatusPillPaint(object? sender, PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var rect = new Rectangle(0, 0, panelStatusPill.Width - 1, panelStatusPill.Height - 1);
        using var path = Palette.CreateRoundedRectangle(rect, 16);
        using var border = new Pen(Palette.CosmicLatte, 1.2f);
        g.DrawPath(border, path);
    }

    private void OnTagPillPaint(object? sender, PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var rect = new Rectangle(0, 0, panelTagPill.Width - 1, panelTagPill.Height - 1);
        using var path = Palette.CreateRoundedRectangle(rect, 16);
        using var border = new Pen(Palette.CosmicLatte, 1.2f);
        g.DrawPath(border, path);
    }

    private void UpdateStats()
    {
        if (InvokeRequired)
        {
            BeginInvoke(UpdateStats);
            return;
        }

        if (lblMetricCapValue != null) lblMetricCapValue.Text = $"{_manager.TotalSlotsCount} Slots";
        if (lblMetricAvailValue != null) lblMetricAvailValue.Text = $"{_manager.AvailableSlotsCount} Free";
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;

        // Warm ambient gradient background (Warm Ivory to Cream)
        using var brush = new LinearGradientBrush(
            ClientRectangle,
            Palette.BackgroundCanvas,
            Color.FromArgb(244, 237, 226),
            60f
        );
        g.FillRectangle(brush, ClientRectangle);

        // Soft animated decorative mesh circle in top right (Deep Burgundy glow)
        float cx = Width - 80;
        float cy = 60 + (float)Math.Sin(_ambientOffset) * 12f;
        using var glowBrush = new SolidBrush(Color.FromArgb(20, Palette.DeepBurgundy));
        g.FillEllipse(glowBrush, cx - 180, cy - 180, 360, 360);

        // Soft decorative circle in bottom left (Cosmic Latte glow)
        float bx = 40;
        float by = Height - 60 + (float)Math.Cos(_ambientOffset) * 10f;
        using var glowBrush2 = new SolidBrush(Color.FromArgb(25, Palette.CosmicLatte));
        g.FillEllipse(glowBrush2, bx - 140, by - 140, 280, 280);

        // Subtle window border in Mocha Cream
        using var borderPen = new Pen(Palette.BorderSubtle, 1.5f);
        g.DrawRectangle(borderPen, 0, 0, Width - 1, Height - 1);
    }

    private void OnTitleBarMouseDown(object? sender, MouseEventArgs e)
    {
        if (e.Button == MouseButtons.Left)
        {
            ReleaseCapture();
            SendMessage(Handle, WM_NCLBUTTONDOWN, HT_CAPTION, 0);
        }
    }

    private async void InitializeWarpTextHeading()
    {
        try
        {
            var webView = new Microsoft.Web.WebView2.WinForms.WebView2
            {
                Location = new Point(lblHeroTitle.Location.X, lblHeroTitle.Location.Y - 5),
                Size = new Size(540, 110),
                DefaultBackgroundColor = Color.Transparent
            };
            panelHeroLeft.Controls.Add(webView);
            webView.BringToFront();

            await webView.EnsureCoreWebView2Async();
            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;

            string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "warpTextHeading.html");
            if (!File.Exists(htmlPath))
            {
                htmlPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets", "warpTextHeading.html");
            }

            if (File.Exists(htmlPath))
            {
                string html = File.ReadAllText(htmlPath);
                webView.NavigateToString(html);
            }
        }
        catch (Exception ex)
        {
            // If WebView2 runtime is unavailable or loading,
            // the designer label lblHeroTitle remains seamlessly visible.
            System.Diagnostics.Debug.WriteLine("WarpText init info: " + ex.Message);
        }
    }
}
