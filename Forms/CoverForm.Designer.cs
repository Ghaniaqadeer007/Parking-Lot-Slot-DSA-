namespace ParkingLotSlotAllocator.Forms;

using System.Drawing;
using System.Windows.Forms;
using ParkingLotSlotAllocator.UI;

partial class CoverForm
{
    private System.ComponentModel.IContainer components = null;

    // Top Bar
    private Panel panelTopBar;
    private Panel panelLogoMark;
    private Label lblLogoMarkText;
    private Label lblBrandName;
    private Button btnMin;
    private Button btnClose;

    // Center Hero
    private Panel panelHeroCenter;
    private Panel panelTitleContainer;
    private Label lblTitlePark;
    private Label lblTitleFlow;
    private Label lblSubtitle;
    private Panel panelGreenRule;
    private Label lblTagline;
    private Button btnEnterDetails;

    // Bottom Strip
    private Panel panelBottomStrip;
    private Panel panelBaysContainer;
    private Panel panelRoad;
    private Panel panelRoadLine;
    private Panel panelCarVisual;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        this.panelTopBar = new Panel();
        this.panelLogoMark = new Panel();
        this.lblLogoMarkText = new Label();
        this.lblBrandName = new Label();
        this.btnMin = new Button();
        this.btnClose = new Button();

        this.panelHeroCenter = new Panel();
        this.panelTitleContainer = new Panel();
        this.lblTitlePark = new Label();
        this.lblTitleFlow = new Label();
        this.lblSubtitle = new Label();
        this.panelGreenRule = new Panel();
        this.lblTagline = new Label();
        this.btnEnterDetails = new Button();

        this.panelBottomStrip = new Panel();
        this.panelBaysContainer = new Panel();
        this.panelRoad = new Panel();
        this.panelRoadLine = new Panel();
        this.panelCarVisual = new Panel();

        this.panelTopBar.SuspendLayout();
        this.panelLogoMark.SuspendLayout();
        this.panelHeroCenter.SuspendLayout();
        this.panelTitleContainer.SuspendLayout();
        this.panelBottomStrip.SuspendLayout();
        this.panelRoad.SuspendLayout();
        this.SuspendLayout();

        // 
        // Form Configuration - Enlarged frame so everything fits neatly with generous breathing room
        // 
        this.AutoScaleMode = AutoScaleMode.Dpi;
        this.ClientSize = new Size(1320, 860);
        this.MinimumSize = new Size(1100, 750);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.None;
        this.BackColor = Palette.Greige;
        this.Text = "ParkFlow - Parking Lot Slot Allocator";

        // 
        // panelTopBar
        // 
        this.panelTopBar.Dock = DockStyle.Top;
        this.panelTopBar.Height = 76;
        this.panelTopBar.BackColor = Color.Transparent;
        this.panelTopBar.Padding = new Padding(40, 0, 40, 0);
        this.panelTopBar.Controls.Add(this.panelLogoMark);
        this.panelTopBar.Controls.Add(this.lblBrandName);
        this.panelTopBar.Controls.Add(this.btnMin);
        this.panelTopBar.Controls.Add(this.btnClose);

        // 
        // panelLogoMark (34x34 Slate pill)
        // 
        this.panelLogoMark.Location = new Point(40, 21);
        this.panelLogoMark.Size = new Size(34, 34);
        this.panelLogoMark.BackColor = Palette.Slate;
        this.panelLogoMark.Controls.Add(this.lblLogoMarkText);

        // 
        // lblLogoMarkText
        // 
        this.lblLogoMarkText.Dock = DockStyle.Fill;
        this.lblLogoMarkText.Text = "P";
        this.lblLogoMarkText.Font = new Font("Georgia", 16F, FontStyle.Bold);
        this.lblLogoMarkText.ForeColor = Palette.Amber;
        this.lblLogoMarkText.TextAlign = ContentAlignment.MiddleCenter;

        // 
        // lblBrandName
        // 
        this.lblBrandName.AutoSize = true;
        this.lblBrandName.Location = new Point(86, 24);
        this.lblBrandName.Text = "ParkFlow";
        this.lblBrandName.Font = new Font("Georgia", 18F, FontStyle.Bold);
        this.lblBrandName.ForeColor = Palette.Black;

        // 
        // btnClose
        // 
        this.btnClose.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        this.btnClose.Location = new Point(1264, 20);
        this.btnClose.Size = new Size(36, 36);
        this.btnClose.FlatStyle = FlatStyle.Flat;
        this.btnClose.FlatAppearance.BorderSize = 0;
        this.btnClose.Text = "✕";
        this.btnClose.Font = new Font("Segoe UI", 11F, FontStyle.Bold);
        this.btnClose.ForeColor = Palette.Slate;
        this.btnClose.BackColor = Color.Transparent;
        this.btnClose.Cursor = Cursors.Hand;

        // 
        // btnMin
        // 
        this.btnMin.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        this.btnMin.Location = new Point(1220, 20);
        this.btnMin.Size = new Size(36, 36);
        this.btnMin.FlatStyle = FlatStyle.Flat;
        this.btnMin.FlatAppearance.BorderSize = 0;
        this.btnMin.Text = "—";
        this.btnMin.Font = new Font("Segoe UI", 11F, FontStyle.Bold);
        this.btnMin.ForeColor = Palette.Slate;
        this.btnMin.BackColor = Color.Transparent;
        this.btnMin.Cursor = Cursors.Hand;

        // 
        // panelHeroCenter - Perfectly centered vertically and horizontally
        // 
        this.panelHeroCenter.Anchor = AnchorStyles.None;
        this.panelHeroCenter.Size = new Size(960, 420);
        this.panelHeroCenter.Location = new Point((this.ClientSize.Width - 960) / 2, 175);
        this.panelHeroCenter.BackColor = Color.Transparent;
        this.panelHeroCenter.Controls.Add(this.panelTitleContainer);
        this.panelHeroCenter.Controls.Add(this.lblSubtitle);
        this.panelHeroCenter.Controls.Add(this.panelGreenRule);
        this.panelHeroCenter.Controls.Add(this.lblTagline);
        this.panelHeroCenter.Controls.Add(this.btnEnterDetails);

        // 
        // panelTitleContainer ("ParkFlow" centered prominently with large typography)
        // 
        this.panelTitleContainer.Size = new Size(680, 115);
        this.panelTitleContainer.Location = new Point((960 - 680) / 2, 10);
        this.panelTitleContainer.BackColor = Color.Transparent;
        this.panelTitleContainer.Controls.Add(this.lblTitlePark);
        this.panelTitleContainer.Controls.Add(this.lblTitleFlow);

        // 
        // lblTitlePark
        // 
        this.lblTitlePark.AutoSize = true;
        this.lblTitlePark.Location = new Point(110, 5);
        this.lblTitlePark.Text = "Park";
        this.lblTitlePark.Font = new Font("Georgia", 68F, FontStyle.Bold);
        this.lblTitlePark.ForeColor = Palette.Slate;

        // 
        // lblTitleFlow
        // 
        this.lblTitleFlow.AutoSize = true;
        this.lblTitleFlow.Location = new Point(345, 5);
        this.lblTitleFlow.Text = "Flow";
        this.lblTitleFlow.Font = new Font("Georgia", 68F, FontStyle.Bold);
        this.lblTitleFlow.ForeColor = Palette.ParkGreen;

        // 
        // lblSubtitle
        // 
        this.lblSubtitle.Size = new Size(960, 40);
        this.lblSubtitle.Location = new Point(0, 140);
        this.lblSubtitle.Text = "Parking Lot Slot Allocator";
        this.lblSubtitle.Font = new Font("Georgia", 24F, FontStyle.Regular);
        this.lblSubtitle.ForeColor = Palette.Ink;
        this.lblSubtitle.TextAlign = ContentAlignment.MiddleCenter;

        // 
        // panelGreenRule (84x3 pixel divider)
        // 
        this.panelGreenRule.Size = new Size(90, 3);
        this.panelGreenRule.Location = new Point((960 - 90) / 2, 195);
        this.panelGreenRule.BackColor = Palette.ParkGreen;

        // 
        // lblTagline
        // 
        this.lblTagline.Size = new Size(660, 50);
        this.lblTagline.Location = new Point((960 - 660) / 2, 215);
        this.lblTagline.Text = "Skip the circling. Your spot is already waiting, and we'll show you the way there.";
        this.lblTagline.Font = new Font("Segoe UI", 13F, FontStyle.Regular);
        this.lblTagline.ForeColor = Palette.Muted;
        this.lblTagline.TextAlign = ContentAlignment.MiddleCenter;

        // 
        // btnEnterDetails
        // 
        this.btnEnterDetails.Size = new Size(260, 58);
        this.btnEnterDetails.Location = new Point((960 - 260) / 2, 295);
        this.btnEnterDetails.Text = "Enter car details   →";
        this.btnEnterDetails.Font = new Font("Segoe UI", 12.5F, FontStyle.Bold);
        this.btnEnterDetails.ForeColor = Color.White;
        this.btnEnterDetails.BackColor = Palette.Slate;
        this.btnEnterDetails.FlatStyle = FlatStyle.Flat;
        this.btnEnterDetails.FlatAppearance.BorderSize = 0;
        this.btnEnterDetails.Cursor = Cursors.Hand;

        // 
        // panelBottomStrip
        // 
        this.panelBottomStrip.Dock = DockStyle.Bottom;
        this.panelBottomStrip.Height = 150;
        this.panelBottomStrip.BackColor = Color.Transparent;
        this.panelBottomStrip.Controls.Add(this.panelBaysContainer);
        this.panelBottomStrip.Controls.Add(this.panelRoad);

        // 
        // panelBaysContainer (9 Bays: Bay 5 is amber highlighted)
        // 
        this.panelBaysContainer.Dock = DockStyle.Top;
        this.panelBaysContainer.Height = 56;
        this.panelBaysContainer.BackColor = Color.Transparent;
        this.CreateBaysInContainer();

        // 
        // panelRoad (Asphalt #242831)
        // 
        this.panelRoad.Dock = DockStyle.Bottom;
        this.panelRoad.Height = 70;
        this.panelRoad.BackColor = Palette.Slate;
        this.panelRoad.Controls.Add(this.panelRoadLine);
        this.panelRoad.Controls.Add(this.panelCarVisual);

        // 
        // panelRoadLine (Dashed white central line)
        // 
        this.panelRoadLine.Dock = DockStyle.Top;
        this.panelRoadLine.Height = 3;
        this.panelRoadLine.Location = new Point(0, 34);
        this.panelRoadLine.BackColor = Color.FromArgb(180, 255, 255, 255);

        // 
        // panelCarVisual (Top-down car graphic)
        // 
        this.panelCarVisual.Size = new Size(96, 48);
        this.panelCarVisual.Location = new Point(610, 11);
        this.panelCarVisual.BackColor = Color.Transparent;

        // 
        // Form Controls Assembly
        // 
        this.Controls.Add(this.panelHeroCenter);
        this.Controls.Add(this.panelTopBar);
        this.Controls.Add(this.panelBottomStrip);

        this.panelTopBar.ResumeLayout(false);
        this.panelTopBar.PerformLayout();
        this.panelLogoMark.ResumeLayout(false);
        this.panelHeroCenter.ResumeLayout(false);
        this.panelTitleContainer.ResumeLayout(false);
        this.panelTitleContainer.PerformLayout();
        this.panelBottomStrip.ResumeLayout(false);
        this.panelRoad.ResumeLayout(false);
        this.ResumeLayout(false);
    }

    private void CreateBaysInContainer()
    {
        int bayWidth = 100;
        int totalWidth = bayWidth * 9;
        int startX = (this.ClientSize.Width - totalWidth) / 2;

        for (int i = 1; i <= 9; i++)
        {
            var bay = new Panel
            {
                Location = new Point(startX + (i - 1) * bayWidth, 0),
                Size = new Size(bayWidth, 56),
                BackColor = (i == 5) ? Color.FromArgb(200, Palette.Amber) : Color.Transparent
            };

            var lbl = new Label
            {
                Dock = DockStyle.Fill,
                Text = i.ToString("D2"),
                Font = new Font("Georgia", 15F, FontStyle.Bold),
                ForeColor = (i == 5) ? Palette.ParkGreen : Palette.Muted,
                TextAlign = ContentAlignment.MiddleCenter
            };
            bay.Controls.Add(lbl);
            this.panelBaysContainer.Controls.Add(bay);
        }
    }
}
