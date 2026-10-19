namespace ParkingLotSlotAllocator.Forms;

using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using ParkingLotSlotAllocator.UI;

public partial class CoverForm : Form
{
    // Windows API for smooth frameless window drag
    public const int WM_NCLBUTTONDOWN = 0xA1;
    public const int HT_CAPTION = 0x2;

    [DllImport("user32.dll")]
    public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

    [DllImport("user32.dll")]
    public static extern bool ReleaseCapture();

    private Microsoft.Web.WebView2.WinForms.WebView2? _webView;

    public CoverForm()
    {
        InitializeComponent();
        AttachEvents();

        bool isDesign = LicenseManager.UsageMode == LicenseUsageMode.Designtime || DesignMode;
        if (!isDesign)
        {
            InitializeInteractiveRuntimeUi();
        }
    }

    private void AttachEvents()
    {
        // Window Controls
        btnClose.Click += (s, e) => Application.Exit();
        btnMin.Click += (s, e) => WindowState = FormWindowState.Minimized;

        // Title Bar Dragging
        panelTopBar.MouseDown += OnTitleBarMouseDown;
        lblBrandName.MouseDown += OnTitleBarMouseDown;
        panelLogoMark.MouseDown += OnTitleBarMouseDown;
        lblLogoMarkText.MouseDown += OnTitleBarMouseDown;

        // Custom Paint for Rounded Elements
        panelLogoMark.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            using var path = CreateRoundedRectangle(panelLogoMark.ClientRectangle, 10);
            using var brush = new SolidBrush(Palette.Slate);
            g.FillPath(brush, path);
        };

        panelKicker.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            var rect = new Rectangle(0, 0, panelKicker.Width - 1, panelKicker.Height - 1);
            using var path = CreateRoundedRectangle(rect, 16);
            using var brush = new SolidBrush(Color.FromArgb(220, 255, 255, 255));
            using var pen = new Pen(Palette.Line, 1f);
            g.FillPath(brush, path);
            g.DrawPath(pen, path);
        };

        panelBlinkDot.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            using var brush = new SolidBrush(Palette.ParkGreen);
            g.FillEllipse(brush, 0, 0, panelBlinkDot.Width - 1, panelBlinkDot.Height - 1);
        };

        btnEnterDetails.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            var rect = new Rectangle(0, 0, btnEnterDetails.Width - 1, btnEnterDetails.Height - 1);
            using var path = CreateRoundedRectangle(rect, 28);
            using var brush = new SolidBrush(Palette.Slate);
            g.FillPath(brush, path);

            TextRenderer.DrawText(
                g,
                btnEnterDetails.Text,
                btnEnterDetails.Font,
                rect,
                Color.White,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter
            );
        };

        panelCarVisual.Paint += (s, e) =>
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            // Draw top-down car silhouette on the asphalt road
            using var carBodyBrush = new SolidBrush(Color.White);
            using var carStroke = new Pen(Color.FromArgb(80, 20, 23, 28), 1.2f);
            using var glassBrush = new SolidBrush(Palette.Slate);

            // Car chassis
            g.FillRectangle(carBodyBrush, 8, 10, 80, 28);
            g.DrawRectangle(carStroke, 8, 10, 80, 28);

            // Windshields
            g.FillRectangle(glassBrush, 26, 13, 36, 22);

            // Headlights
            using var lightBrush = new SolidBrush(Palette.Amber);
            g.FillRectangle(lightBrush, 84, 12, 4, 6);
            g.FillRectangle(lightBrush, 84, 30, 4, 6);

            // Taillights
            using var tailBrush = new SolidBrush(Color.FromArgb(255, 110, 110));
            g.FillRectangle(tailBrush, 8, 12, 3, 6);
            g.FillRectangle(tailBrush, 8, 30, 3, 6);
        };
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;

        // Rich background gradient matching CSS:
        // linear-gradient(160deg, #E6E1D9 0%, #D3CBC1 55%, #C5BCB0 100%)
        using var baseBrush = new LinearGradientBrush(
            ClientRectangle,
            Color.FromArgb(230, 225, 217),
            Color.FromArgb(197, 188, 176),
            160f
        );
        g.FillRectangle(baseBrush, ClientRectangle);

        // Soft ambient blob A at top left
        using var blobABrush = new SolidBrush(Color.FromArgb(90, 255, 255, 255));
        g.FillEllipse(blobABrush, -120, -100, 380, 380);

        // Soft ambient blob B at bottom right
        using var blobBBrush = new SolidBrush(Color.FromArgb(60, 142, 149, 161));
        g.FillEllipse(blobBBrush, Width - 240, Height - 260, 300, 300);
    }

    private async void InitializeInteractiveRuntimeUi()
    {
        try
        {
            _webView = new Microsoft.Web.WebView2.WinForms.WebView2
            {
                Dock = DockStyle.Fill,
                DefaultBackgroundColor = Color.Transparent
            };

            Controls.Add(_webView);
            _webView.BringToFront();

            await _webView.EnsureCoreWebView2Async();
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;

            string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "parkflow_ui.html");
            if (!File.Exists(htmlPath))
            {
                htmlPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets", "parkflow_ui.html");
            }

            if (File.Exists(htmlPath))
            {
                string html = File.ReadAllText(htmlPath);
                _webView.NavigateToString(html);
            }
        }
        catch (Exception ex)
        {
            // If WebView2 runtime is loading or not installed,
            // the full native designer controls are seamlessly active!
            System.Diagnostics.Debug.WriteLine("Runtime UI notification: " + ex.Message);
            if (_webView != null)
            {
                Controls.Remove(_webView);
                _webView.Dispose();
                _webView = null;
            }
        }
    }

    private void OnTitleBarMouseDown(object? sender, MouseEventArgs e)
    {
        if (e.Button == MouseButtons.Left)
        {
            ReleaseCapture();
            SendMessage(Handle, WM_NCLBUTTONDOWN, HT_CAPTION, 0);
        }
    }

    private static GraphicsPath CreateRoundedRectangle(Rectangle rect, int radius)
    {
        var path = new GraphicsPath();
        if (radius <= 0)
        {
            path.AddRectangle(rect);
            return path;
        }

        int d = radius * 2;
        path.AddArc(rect.X, rect.Y, d, d, 180, 90);
        path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
        path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
        path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }
}
