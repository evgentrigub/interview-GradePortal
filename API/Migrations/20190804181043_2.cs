using Microsoft.EntityFrameworkCore.Migrations;

namespace GradePortalAPI.Migrations
{
    public partial class _2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                "City",
                "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                "Position",
                "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                "City",
                "Users");

            migrationBuilder.DropColumn(
                "Position",
                "Users");
        }
    }
}