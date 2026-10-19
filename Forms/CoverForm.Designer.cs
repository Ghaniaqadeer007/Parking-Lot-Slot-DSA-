namespace ParkingLotSlotAllocator.Forms;

using System.Drawing;
using System.Windows.Forms;
using ParkingLotSlotAllocator.UI;

partial class CoverForm
{
    private System.ComponentModel.IContainer components = null;

    // Top Bar
    private Panel panelTopBar;
    private Panel panelLogo;
    private Label lblLogoText;
    private Label lblBrand;
    private Label lblBrandSub;
    private Panel panelStatusPill;
    private Label lblStatusPillText;
    private ModernButton btnClose;
    private ModernButton btnMin;

    // Main Layout Container
    private Panel panelMainCenter;
    private Panel panelHeroLeft;

    // Hero Left Elements
    private Panel panelTagPill;
    private Label lblTagPillText;
    private Label lblHeroTitle;
    private Label lblHeroSub;
    private ModernButton btnLaunch;
    private ModernButton btnDsa;

    // Feature Cards
    private FlowLayoutPanel flowFeatureCards;
    private ModernCard cardFeatureHeap;
    private Label lblHeapTitle;
    private Label lblHeapBadge;
    private Label lblHeapDesc;
    private ModernCard cardFeatureHash;
    private Label lblHashTitle;
    private Label lblHashBadge;
    private Label lblHashDesc;
    private ModernCard cardFeatureFifo;
    private Label lblFifoTitle;
    private Label lblFifoBadge;
    private Label lblFifoDesc;

    // Live Metrics Card
    private ModernCard cardMetrics;
    private Label lblMetricCapHeader;
    private Label lblMetricCapValue;
    private Label lblMetricAvailHeader;
    private Label lblMetricAvailValue;
    private Label lblMetricSpeedHeader;
    private Label lblMetricSpeedValue;

    // Right Preview Card
    private ModernCard cardRightPreview;
    private Panel panelPreviewHeader;
    private Label lblPreviewTitle;
    private Label lblPreviewSub;
    private ParkingSimulationCanvas simCanvas;
    private Panel panelPreviewFooter;
    private ModernButton btnQuickSim;
    private ModernButton btnOpenDashboard;

    // Bottom Bar
    private Panel panelBottomBar;
    private Label lblFooterTech;
    private Label lblFooterDsa;

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _fadeInTimer?.Dispose();
            _ambientTimer?.Dispose();
            components?.Dispose();
        }
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        this.panelTopBar = new Panel();
        this.panelLogo = new Panel();
        this.lblLogoText = new Label();
        this.lblBrand = new Label();
        this.lblBrandSub = new Label();
        this.panelStatusPill = new Panel();
        this.lblStatusPillText = new Label();
        this.btnMin = new ModernButton();
        this.btnClose = new ModernButton();

        this.panelMainCenter = new Panel();
        this.panelHeroLeft = new Panel();
        this.panelTagPill = new Panel();
        this.lblTagPillText = new Label();
        this.lblHeroTitle = new Label();
        this.lblHeroSub = new Label();
        this.btnLaunch = new ModernButton();
        this.btnDsa = new ModernButton();

        this.flowFeatureCards = new FlowLayoutPanel();
        this.cardFeatureHeap = new ModernCard();
        this.lblHeapTitle = new Label();
        this.lblHeapBadge = new Label();
        this.lblHeapDesc = new Label();
        this.cardFeatureHash = new ModernCard();
        this.lblHashTitle = new Label();
        this.lblHashBadge = new Label();
        this.lblHashDesc = new Label();
        this.cardFeatureFifo = new ModernCard();
        this.lblFifoTitle = new Label();
        this.lblFifoBadge = new Label();
        this.lblFifoDesc = new Label();

        this.cardMetrics = new ModernCard();
        this.lblMetricCapHeader = new Label();
        this.lblMetricCapValue = new Label();
        this.lblMetricAvailHeader = new Label();
        this.lblMetricAvailValue = new Label();
        this.lblMetricSpeedHeader = new Label();
        this.lblMetricSpeedValue = new Label();

        this.cardRightPreview = new ModernCard();
        this.panelPreviewHeader = new Panel();
        this.lblPreviewTitle = new Label();
        this.lblPreviewSub = new Label();
        this.simCanvas = new ParkingSimulationCanvas();
        this.panelPreviewFooter = new Panel();
        this.btnQuickSim = new ModernButton();
        this.btnOpenDashboard = new ModernButton();

        this.panelBottomBar = new Panel();
        this.lblFooterTech = new Label();
        this.lblFooterDsa = new Label();

        this.panelTopBar.SuspendLayout();
        this.panelLogo.SuspendLayout();
        this.panelStatusPill.SuspendLayout();
        this.panelMainCenter.SuspendLayout();
        this.panelHeroLeft.SuspendLayout();
        this.panelTagPill.SuspendLayout();
        this.flowFeatureCards.SuspendLayout();
        this.cardFeatureHeap.SuspendLayout();
        this.cardFeatureHash.SuspendLayout();
        this.cardFeatureFifo.SuspendLayout();
        this.cardMetrics.SuspendLayout();
        this.cardRightPreview.SuspendLayout();
        this.panelPreviewHeader.SuspendLayout();
        this.panelPreviewFooter.SuspendLayout();
        this.panelBottomBar.SuspendLayout();
        this.SuspendLayout();

        // 
        // Form Configuration
        // 
        this.AutoScaleMode = AutoScaleMode.Dpi;
        this.ClientSize = new Size(1220, 780);
        this.MinimumSize = new Size(1100, 720);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.None;
        this.BackColor = Palette.BackgroundCanvas;
        this.Text = "Parking Lot Slot Allocater";

        // 
        // panelTopBar
        // 
        this.panelTopBar.Dock = DockStyle.Top;
        this.panelTopBar.Height = 68;
        this.panelTopBar.BackColor = Color.Transparent;
        this.panelTopBar.Padding = new Padding(28, 14, 28, 14);
        this.panelTopBar.Controls.Add(this.panelLogo);
        this.panelTopBar.Controls.Add(this.lblBrand);
        this.panelTopBar.Controls.Add(this.lblBrandSub);
        this.panelTopBar.Controls.Add(this.panelStatusPill);
        this.panelTopBar.Controls.Add(this.btnMin);
        this.panelTopBar.Controls.Add(this.btnClose);

        // 
        // panelLogo
        // 
        this.panelLogo.Size = new Size(40, 40);
        this.panelLogo.Location = new Point(28, 14);
        this.panelLogo.BackColor = Color.Transparent;
        this.panelLogo.Controls.Add(this.lblLogoText);

        // 
        // lblLogoText
        // 
        this.lblLogoText.Dock = DockStyle.Fill;
        this.lblLogoText.Text = "P";
        this.lblLogoText.Font = new Font("Segoe UI", 14F, FontStyle.Bold);
        this.lblLogoText.ForeColor = Color.White;
        this.lblLogoText.TextAlign = ContentAlignment.MiddleCenter;

        // 
        // lblBrand
        // 
        this.lblBrand.Text = "PARKFLOW";
        this.lblBrand.Font = new Font("Georgia", 13.5F, FontStyle.Bold);
        this.lblBrand.ForeColor = Palette.DeepBurgundy;
        this.lblBrand.Location = new Point(78, 14);
        this.lblBrand.AutoSize = true;

        // 
        // lblBrandSub
        // 
        this.lblBrandSub.Text = "DSA ALLOCATOR SUITE";
        this.lblBrandSub.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblBrandSub.ForeColor = Palette.CosmicLatte;
        this.lblBrandSub.Location = new Point(80, 37);
        this.lblBrandSub.AutoSize = true;

        // 
        // panelStatusPill
        // 
        this.panelStatusPill.Size = new Size(160, 32);
        this.panelStatusPill.Location = new Point(260, 18);
        this.panelStatusPill.BackColor = Palette.MochaCream;
        this.panelStatusPill.Controls.Add(this.lblStatusPillText);

        // 
        // lblStatusPillText
        // 
        this.lblStatusPillText.Dock = DockStyle.Fill;
        this.lblStatusPillText.Text = "●  SYSTEM READY";
        this.lblStatusPillText.Font = new Font("Segoe UI", 8F, FontStyle.Bold);
        this.lblStatusPillText.ForeColor = Palette.DeepBurgundy;
        this.lblStatusPillText.TextAlign = ContentAlignment.MiddleCenter;

        // 
        // btnMin
        // 
        this.btnMin.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        this.btnMin.Text = "—";
        this.btnMin.ButtonStyle = ModernButtonStyle.Ghost;
        this.btnMin.Size = new Size(36, 36);
        this.btnMin.Location = new Point(1122, 16);
        this.btnMin.BorderRadius = 18;

        // 
        // btnClose
        // 
        this.btnClose.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        this.btnClose.Text = "✕";
        this.btnClose.ButtonStyle = ModernButtonStyle.Ghost;
        this.btnClose.Size = new Size(36, 36);
        this.btnClose.Location = new Point(1166, 16);
        this.btnClose.BorderRadius = 18;

        // 
        // panelBottomBar
        // 
        this.panelBottomBar.Dock = DockStyle.Bottom;
        this.panelBottomBar.Height = 65;
        this.panelBottomBar.BackColor = Palette.SurfaceCard;
        this.panelBottomBar.Controls.Add(this.lblFooterTech);
        this.panelBottomBar.Controls.Add(this.lblFooterDsa);

        // 
        // lblFooterTech
        // 
        this.lblFooterTech.Text = "⚡ C# .NET 8 WinForms • Visual Studio Ready • Cosmic Latte, Mocha Cream & Deep Burgundy Theme";
        this.lblFooterTech.Font = new Font("Segoe UI", 8.8F, FontStyle.Regular);
        this.lblFooterTech.ForeColor = Palette.TextSecondary;
        this.lblFooterTech.Location = new Point(32, 22);
        this.lblFooterTech.AutoSize = true;

        // 
        // lblFooterDsa
        // 
        this.lblFooterDsa.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        this.lblFooterDsa.Text = "Algorithms: Min-Heap O(log N) • Hash Map O(1) • FIFO Queue • LIFO Stack";
        this.lblFooterDsa.Font = new Font("Segoe UI", 8.8F, FontStyle.Bold);
        this.lblFooterDsa.ForeColor = Palette.DeepBurgundy;
        this.lblFooterDsa.Location = new Point(660, 22);
        this.lblFooterDsa.AutoSize = true;

        // 
        // panelMainCenter
        // 
        this.panelMainCenter.Dock = DockStyle.Fill;
        this.panelMainCenter.Padding = new Padding(32, 12, 32, 12);
        this.panelMainCenter.BackColor = Color.Transparent;
        this.panelMainCenter.Controls.Add(this.panelHeroLeft);
        this.panelMainCenter.Controls.Add(this.cardRightPreview);

        // 
        // panelHeroLeft
        // 
        this.panelHeroLeft.Location = new Point(32, 16);
        this.panelHeroLeft.Size = new Size(540, 600);
        this.panelHeroLeft.BackColor = Color.Transparent;
        this.panelHeroLeft.Controls.Add(this.panelTagPill);
        this.panelHeroLeft.Controls.Add(this.lblHeroTitle);
        this.panelHeroLeft.Controls.Add(this.lblHeroSub);
        this.panelHeroLeft.Controls.Add(this.btnLaunch);
        this.panelHeroLeft.Controls.Add(this.btnDsa);
        this.panelHeroLeft.Controls.Add(this.flowFeatureCards);
        this.panelHeroLeft.Controls.Add(this.cardMetrics);

        // 
        // panelTagPill
        // 
        this.panelTagPill.Size = new Size(345, 32);
        this.panelTagPill.Location = new Point(0, 10);
        this.panelTagPill.BackColor = Palette.MochaCream;
        this.panelTagPill.Controls.Add(this.lblTagPillText);

        // 
        // lblTagPillText
        // 
        this.lblTagPillText.Dock = DockStyle.Fill;
        this.lblTagPillText.Text = "✦  DSA ALGORITHM ENGINE • COSMIC LATTE & BURGUNDY";
        this.lblTagPillText.Font = new Font("Segoe UI", 8.2F, FontStyle.Bold);
        this.lblTagPillText.ForeColor = Palette.DeepBurgundy;
        this.lblTagPillText.TextAlign = ContentAlignment.MiddleCenter;

        // 
        // lblHeroTitle
        // 
        this.lblHeroTitle.Text = "PARKING LOT\nSLOT ALLOCATER";
        this.lblHeroTitle.Font = new Font("Georgia", 29F, FontStyle.Bold);
        this.lblHeroTitle.ForeColor = Palette.DeepBurgundy;
        this.lblHeroTitle.Location = new Point(0, 56);
        this.lblHeroTitle.Size = new Size(530, 100);

        // 
        // lblHeroSub
        // 
        this.lblHeroSub.Text = "An intelligent, high-speed parking lot slot allocation system engineered for maximum efficiency. Powered by Min-Heap priority queues for instant nearest bay routing, O(1) hash indexing, and smooth real-time visual simulation.";
        this.lblHeroSub.Font = new Font("Segoe UI", 10F, FontStyle.Regular);
        this.lblHeroSub.ForeColor = Palette.TextSecondary;
        this.lblHeroSub.Location = new Point(2, 162);
        this.lblHeroSub.Size = new Size(515, 68);

        // 
        // btnLaunch
        // 
        this.btnLaunch.Text = "🚀 Launch Slot Allocator →";
        this.btnLaunch.ButtonStyle = ModernButtonStyle.Primary;
        this.btnLaunch.Font = new Font("Segoe UI", 11F, FontStyle.Bold);
        this.btnLaunch.Size = new Size(230, 50);
        this.btnLaunch.Location = new Point(0, 242);
        this.btnLaunch.BorderRadius = 14;

        // 
        // btnDsa
        // 
        this.btnDsa.Text = "🧠 Explore DSA Specs";
        this.btnDsa.ButtonStyle = ModernButtonStyle.Ghost;
        this.btnDsa.Font = new Font("Segoe UI", 10.5F, FontStyle.Bold);
        this.btnDsa.Size = new Size(180, 50);
        this.btnDsa.Location = new Point(242, 242);
        this.btnDsa.BorderRadius = 14;

        // 
        // flowFeatureCards
        // 
        this.flowFeatureCards.Location = new Point(0, 318);
        this.flowFeatureCards.Size = new Size(540, 150);
        this.flowFeatureCards.FlowDirection = FlowDirection.LeftToRight;
        this.flowFeatureCards.WrapContents = false;
        this.flowFeatureCards.BackColor = Color.Transparent;
        this.flowFeatureCards.Controls.Add(this.cardFeatureHeap);
        this.flowFeatureCards.Controls.Add(this.cardFeatureHash);
        this.flowFeatureCards.Controls.Add(this.cardFeatureFifo);

        // 
        // cardFeatureHeap
        // 
        this.cardFeatureHeap.Size = new Size(166, 136);
        this.cardFeatureHeap.Margin = new Padding(0, 0, 10, 0);
        this.cardFeatureHeap.CardColor = Palette.SurfaceCard;
        this.cardFeatureHeap.Controls.Add(this.lblHeapTitle);
        this.cardFeatureHeap.Controls.Add(this.lblHeapBadge);
        this.cardFeatureHeap.Controls.Add(this.lblHeapDesc);

        this.lblHeapTitle.Text = "⚡ Min-Heap";
        this.lblHeapTitle.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
        this.lblHeapTitle.ForeColor = Palette.TextPrimary;
        this.lblHeapTitle.Location = new Point(14, 14);
        this.lblHeapTitle.AutoSize = true;

        this.lblHeapBadge.Text = "O(log N)";
        this.lblHeapBadge.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblHeapBadge.ForeColor = Palette.Primary;
        this.lblHeapBadge.BackColor = Palette.PrimaryLight;
        this.lblHeapBadge.Location = new Point(14, 38);
        this.lblHeapBadge.Padding = new Padding(4, 2, 4, 2);
        this.lblHeapBadge.AutoSize = true;

        this.lblHeapDesc.Text = "Nearest slot routing relative to entrance gate";
        this.lblHeapDesc.Font = new Font("Segoe UI", 8F);
        this.lblHeapDesc.ForeColor = Palette.TextSecondary;
        this.lblHeapDesc.Location = new Point(14, 68);
        this.lblHeapDesc.Size = new Size(138, 54);

        // 
        // cardFeatureHash
        // 
        this.cardFeatureHash.Size = new Size(166, 136);
        this.cardFeatureHash.Margin = new Padding(0, 0, 10, 0);
        this.cardFeatureHash.CardColor = Palette.SurfaceCard;
        this.cardFeatureHash.Controls.Add(this.lblHashTitle);
        this.cardFeatureHash.Controls.Add(this.lblHashBadge);
        this.cardFeatureHash.Controls.Add(this.lblHashDesc);

        this.lblHashTitle.Text = "🔍 Hash Table";
        this.lblHashTitle.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
        this.lblHashTitle.ForeColor = Palette.TextPrimary;
        this.lblHashTitle.Location = new Point(14, 14);
        this.lblHashTitle.AutoSize = true;

        this.lblHashBadge.Text = "O(1) Search";
        this.lblHashBadge.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblHashBadge.ForeColor = Palette.DeepBurgundy;
        this.lblHashBadge.BackColor = Palette.MochaCream;
        this.lblHashBadge.Location = new Point(14, 38);
        this.lblHashBadge.Padding = new Padding(4, 2, 4, 2);
        this.lblHashBadge.AutoSize = true;

        this.lblHashDesc.Text = "Instant plate & ticket verification";
        this.lblHashDesc.Font = new Font("Segoe UI", 8F);
        this.lblHashDesc.ForeColor = Palette.TextSecondary;
        this.lblHashDesc.Location = new Point(14, 68);
        this.lblHashDesc.Size = new Size(138, 54);

        // 
        // cardFeatureFifo
        // 
        this.cardFeatureFifo.Size = new Size(166, 136);
        this.cardFeatureFifo.Margin = new Padding(0, 0, 10, 0);
        this.cardFeatureFifo.CardColor = Palette.SurfaceCard;
        this.cardFeatureFifo.Controls.Add(this.lblFifoTitle);
        this.cardFeatureFifo.Controls.Add(this.lblFifoBadge);
        this.cardFeatureFifo.Controls.Add(this.lblFifoDesc);

        this.lblFifoTitle.Text = "⏳ FIFO Buffer";
        this.lblFifoTitle.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
        this.lblFifoTitle.ForeColor = Palette.TextPrimary;
        this.lblFifoTitle.Location = new Point(14, 14);
        this.lblFifoTitle.AutoSize = true;

        this.lblFifoBadge.Text = "Zero Wait";
        this.lblFifoBadge.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblFifoBadge.ForeColor = Palette.Success;
        this.lblFifoBadge.BackColor = Palette.SuccessLight;
        this.lblFifoBadge.Location = new Point(14, 38);
        this.lblFifoBadge.Padding = new Padding(4, 2, 4, 2);
        this.lblFifoBadge.AutoSize = true;

        this.lblFifoDesc.Text = "Automatic vehicle queue dispatch";
        this.lblFifoDesc.Font = new Font("Segoe UI", 8F);
        this.lblFifoDesc.ForeColor = Palette.TextSecondary;
        this.lblFifoDesc.Location = new Point(14, 68);
        this.lblFifoDesc.Size = new Size(138, 54);

        // 
        // cardMetrics
        // 
        this.cardMetrics.Location = new Point(0, 480);
        this.cardMetrics.Size = new Size(515, 96);
        this.cardMetrics.CardColor = Palette.SurfaceCard;
        this.cardMetrics.Controls.Add(this.lblMetricCapHeader);
        this.cardMetrics.Controls.Add(this.lblMetricCapValue);
        this.cardMetrics.Controls.Add(this.lblMetricAvailHeader);
        this.cardMetrics.Controls.Add(this.lblMetricAvailValue);
        this.cardMetrics.Controls.Add(this.lblMetricSpeedHeader);
        this.cardMetrics.Controls.Add(this.lblMetricSpeedValue);

        this.lblMetricCapHeader.Text = "TOTAL CAPACITY";
        this.lblMetricCapHeader.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblMetricCapHeader.ForeColor = Palette.TextMuted;
        this.lblMetricCapHeader.Location = new Point(24, 18);
        this.lblMetricCapHeader.AutoSize = true;

        this.lblMetricCapValue.Text = "48 Slots";
        this.lblMetricCapValue.Font = new Font("Segoe UI", 13F, FontStyle.Bold);
        this.lblMetricCapValue.ForeColor = Palette.TextPrimary;
        this.lblMetricCapValue.Location = new Point(24, 40);
        this.lblMetricCapValue.AutoSize = true;

        this.lblMetricAvailHeader.Text = "AVAILABLE (HEAP)";
        this.lblMetricAvailHeader.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblMetricAvailHeader.ForeColor = Palette.TextMuted;
        this.lblMetricAvailHeader.Location = new Point(190, 18);
        this.lblMetricAvailHeader.AutoSize = true;

        this.lblMetricAvailValue.Text = "43 Free";
        this.lblMetricAvailValue.Font = new Font("Segoe UI", 13F, FontStyle.Bold);
        this.lblMetricAvailValue.ForeColor = Palette.Success;
        this.lblMetricAvailValue.Location = new Point(190, 40);
        this.lblMetricAvailValue.AutoSize = true;

        this.lblMetricSpeedHeader.Text = "ALLOCATION SPEED";
        this.lblMetricSpeedHeader.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
        this.lblMetricSpeedHeader.ForeColor = Palette.TextMuted;
        this.lblMetricSpeedHeader.Location = new Point(360, 18);
        this.lblMetricSpeedHeader.AutoSize = true;

        this.lblMetricSpeedValue.Text = "< 0.8 ms";
        this.lblMetricSpeedValue.Font = new Font("Segoe UI", 13F, FontStyle.Bold);
        this.lblMetricSpeedValue.ForeColor = Palette.Primary;
        this.lblMetricSpeedValue.Location = new Point(360, 40);
        this.lblMetricSpeedValue.AutoSize = true;

        // 
        // cardRightPreview
        // 
        this.cardRightPreview.Location = new Point(590, 16);
        this.cardRightPreview.Size = new Size(570, 595);
        this.cardRightPreview.CardColor = Palette.SurfaceCard;
        this.cardRightPreview.Controls.Add(this.panelPreviewHeader);
        this.cardRightPreview.Controls.Add(this.simCanvas);
        this.cardRightPreview.Controls.Add(this.panelPreviewFooter);

        // 
        // panelPreviewHeader
        // 
        this.panelPreviewHeader.Dock = DockStyle.Top;
        this.panelPreviewHeader.Height = 48;
        this.panelPreviewHeader.BackColor = Color.Transparent;
        this.panelPreviewHeader.Controls.Add(this.lblPreviewTitle);
        this.panelPreviewHeader.Controls.Add(this.lblPreviewSub);

        this.lblPreviewTitle.Text = "Live Parking Lot Interactive Simulation";
        this.lblPreviewTitle.Font = new Font("Segoe UI", 11.5F, FontStyle.Bold);
        this.lblPreviewTitle.ForeColor = Palette.TextPrimary;
        this.lblPreviewTitle.Location = new Point(8, 4);
        this.lblPreviewTitle.AutoSize = true;

        this.lblPreviewSub.Text = "Visualizing real-time entry gate, car routing, and slot allocation beacon";
        this.lblPreviewSub.Font = new Font("Segoe UI", 8F, FontStyle.Regular);
        this.lblPreviewSub.ForeColor = Palette.TextSecondary;
        this.lblPreviewSub.Location = new Point(10, 26);
        this.lblPreviewSub.AutoSize = true;

        // 
        // simCanvas
        // 
        this.simCanvas.Dock = DockStyle.Fill;
        this.simCanvas.Location = new Point(18, 66);
        this.simCanvas.Size = new Size(534, 440);

        // 
        // panelPreviewFooter
        // 
        this.panelPreviewFooter.Dock = DockStyle.Bottom;
        this.panelPreviewFooter.Height = 56;
        this.panelPreviewFooter.BackColor = Color.Transparent;
        this.panelPreviewFooter.Controls.Add(this.btnQuickSim);
        this.panelPreviewFooter.Controls.Add(this.btnOpenDashboard);

        this.btnQuickSim.Text = "⚡ Quick Park Simulation";
        this.btnQuickSim.ButtonStyle = ModernButtonStyle.Secondary;
        this.btnQuickSim.Size = new Size(190, 38);
        this.btnQuickSim.Location = new Point(10, 8);
        this.btnQuickSim.BorderRadius = 10;

        this.btnOpenDashboard.Text = "Open Full Dashboard →";
        this.btnOpenDashboard.ButtonStyle = ModernButtonStyle.Ghost;
        this.btnOpenDashboard.Size = new Size(180, 38);
        this.btnOpenDashboard.Location = new Point(210, 8);
        this.btnOpenDashboard.BorderRadius = 10;

        // 
        // Form Controls Assembly
        // 
        this.Controls.Add(this.panelMainCenter);
        this.Controls.Add(this.panelTopBar);
        this.Controls.Add(this.panelBottomBar);

        this.panelTopBar.ResumeLayout(false);
        this.panelTopBar.PerformLayout();
        this.panelLogo.ResumeLayout(false);
        this.panelStatusPill.ResumeLayout(false);
        this.panelMainCenter.ResumeLayout(false);
        this.panelHeroLeft.ResumeLayout(false);
        this.panelHeroLeft.PerformLayout();
        this.panelTagPill.ResumeLayout(false);
        this.flowFeatureCards.ResumeLayout(false);
        this.cardFeatureHeap.ResumeLayout(false);
        this.cardFeatureHeap.PerformLayout();
        this.cardFeatureHash.ResumeLayout(false);
        this.cardFeatureHash.PerformLayout();
        this.cardFeatureFifo.ResumeLayout(false);
        this.cardFeatureFifo.PerformLayout();
        this.cardMetrics.ResumeLayout(false);
        this.cardMetrics.PerformLayout();
        this.cardRightPreview.ResumeLayout(false);
        this.panelPreviewHeader.ResumeLayout(false);
        this.panelPreviewHeader.PerformLayout();
        this.panelPreviewFooter.ResumeLayout(false);
        this.panelBottomBar.ResumeLayout(false);
        this.panelBottomBar.PerformLayout();
        this.ResumeLayout(false);
    }
}
