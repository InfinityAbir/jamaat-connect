using JamaatConnect.Domain.Entities;
using JamaatConnect.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JamaatConnect.Infrastructure.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(JamaatContext context, UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            // Check if already seeded
            if (await context.Locations.AnyAsync())
            {
                await SeedDemoDataForExistingDatabaseAsync(context, userManager);
                return;
            }

            // Bangladesh - Country (Level 0)
            var bangladesh = new Location("Bangladesh", "BD", 0);
            context.Locations.Add(bangladesh);
            await context.SaveChangesAsync();

            // Divisions (Level 1)
            var divisions = new[]
            {
                new Location("Barishal", "BD-01", 1, bangladesh.Id),
                new Location("Chattogram", "BD-02", 1, bangladesh.Id),
                new Location("Dhaka", "BD-03", 1, bangladesh.Id),
                new Location("Khulna", "BD-04", 1, bangladesh.Id),
                new Location("Mymensingh", "BD-05", 1, bangladesh.Id),
                new Location("Rajshahi", "BD-06", 1, bangladesh.Id),
                new Location("Rangpur", "BD-07", 1, bangladesh.Id),
                new Location("Sylhet", "BD-08", 1, bangladesh.Id),
            };
            context.Locations.AddRange(divisions);
            await context.SaveChangesAsync();

            // Districts (Level 2) - Key districts for each division
            var districts = new[]
            {
                // Barishal Division
                new Location("Barguna", "BD-01-01", 2, divisions[0].Id),
                new Location("Barishal", "BD-01-02", 2, divisions[0].Id),
                new Location("Bhola", "BD-01-03", 2, divisions[0].Id),
                new Location("Jhalokati", "BD-01-04", 2, divisions[0].Id),
                new Location("Patuakhali", "BD-01-05", 2, divisions[0].Id),
                new Location("Pirojpur", "BD-01-06", 2, divisions[0].Id),

                // Chattogram Division
                new Location("Bandarban", "BD-02-01", 2, divisions[1].Id),
                new Location("Brahmanbaria", "BD-02-02", 2, divisions[1].Id),
                new Location("Chandpur", "BD-02-03", 2, divisions[1].Id),
                new Location("Chattogram", "BD-02-04", 2, divisions[1].Id),
                new Location("Cox's Bazar", "BD-02-05", 2, divisions[1].Id),
                new Location("Cumilla", "BD-02-06", 2, divisions[1].Id),
                new Location("Feni", "BD-02-07", 2, divisions[1].Id),
                new Location("Khagrachhari", "BD-02-08", 2, divisions[1].Id),
                new Location("Lakshmipur", "BD-02-09", 2, divisions[1].Id),
                new Location("Noakhali", "BD-02-10", 2, divisions[1].Id),
                new Location("Rangamati", "BD-02-11", 2, divisions[1].Id),

                // Dhaka Division
                new Location("Dhaka", "BD-03-01", 2, divisions[2].Id),
                new Location("Faridpur", "BD-03-02", 2, divisions[2].Id),
                new Location("Gazipur", "BD-03-03", 2, divisions[2].Id),
                new Location("Gopalganj", "BD-03-04", 2, divisions[2].Id),
                new Location("Kishoreganj", "BD-03-05", 2, divisions[2].Id),
                new Location("Madaripur", "BD-03-06", 2, divisions[2].Id),
                new Location("Manikganj", "BD-03-07", 2, divisions[2].Id),
                new Location("Munshiganj", "BD-03-08", 2, divisions[2].Id),
                new Location("Narayanganj", "BD-03-09", 2, divisions[2].Id),
                new Location("Narsingdi", "BD-03-10", 2, divisions[2].Id),
                new Location("Rajbari", "BD-03-11", 2, divisions[2].Id),
                new Location("Shariatpur", "BD-03-12", 2, divisions[2].Id),
                new Location("Tangail", "BD-03-13", 2, divisions[2].Id),

                // Khulna Division
                new Location("Bagerhat", "BD-04-01", 2, divisions[3].Id),
                new Location("Chuadanga", "BD-04-02", 2, divisions[3].Id),
                new Location("Jessore", "BD-04-03", 2, divisions[3].Id),
                new Location("Jhenaidah", "BD-04-04", 2, divisions[3].Id),
                new Location("Khulna", "BD-04-05", 2, divisions[3].Id),
                new Location("Kushtia", "BD-04-06", 2, divisions[3].Id),
                new Location("Magura", "BD-04-07", 2, divisions[3].Id),
                new Location("Meherpur", "BD-04-08", 2, divisions[3].Id),
                new Location("Narail", "BD-04-09", 2, divisions[3].Id),
                new Location("Satkhira", "BD-04-10", 2, divisions[3].Id),

                // Mymensingh Division
                new Location("Jamalpur", "BD-05-01", 2, divisions[4].Id),
                new Location("Mymensingh", "BD-05-02", 2, divisions[4].Id),
                new Location("Netrokona", "BD-05-03", 2, divisions[4].Id),
                new Location("Sherpur", "BD-05-04", 2, divisions[4].Id),

                // Rajshahi Division
                new Location("Bogura", "BD-06-01", 2, divisions[5].Id),
                new Location("Chapainawabganj", "BD-06-02", 2, divisions[5].Id),
                new Location("Joypurhat", "BD-06-03", 2, divisions[5].Id),
                new Location("Naogaon", "BD-06-04", 2, divisions[5].Id),
                new Location("Natore", "BD-06-05", 2, divisions[5].Id),
                new Location("Pabna", "BD-06-06", 2, divisions[5].Id),
                new Location("Rajshahi", "BD-06-07", 2, divisions[5].Id),
                new Location("Sirajganj", "BD-06-08", 2, divisions[5].Id),

                // Rangpur Division
                new Location("Dinajpur", "BD-07-01", 2, divisions[6].Id),
                new Location("Gaibandha", "BD-07-02", 2, divisions[6].Id),
                new Location("Kurigram", "BD-07-03", 2, divisions[6].Id),
                new Location("Lalmonirhat", "BD-07-04", 2, divisions[6].Id),
                new Location("Nilphamari", "BD-07-05", 2, divisions[6].Id),
                new Location("Panchagarh", "BD-07-06", 2, divisions[6].Id),
                new Location("Rangpur", "BD-07-07", 2, divisions[6].Id),
                new Location("Thakurgaon", "BD-07-08", 2, divisions[6].Id),

                // Sylhet Division
                new Location("Habiganj", "BD-08-01", 2, divisions[7].Id),
                new Location("Moulvibazar", "BD-08-02", 2, divisions[7].Id),
                new Location("Sunamganj", "BD-08-03", 2, divisions[7].Id),
                new Location("Sylhet", "BD-08-04", 2, divisions[7].Id),
            };

            context.Locations.AddRange(districts);
            await context.SaveChangesAsync();

            // Default system roles
            var roles = new[]
            {
                new Role("Administrator", "System administrator with full access", true),
                new Role("Moderator", "Content moderator", true),
                new Role("Organizer", "Verified event organizer", true),
                new Role("Participant", "Registered participant", true),
            };
            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();

            // Seed default admin user
            var adminEmail = "admin@jamaatconnect.com";
            var adminPassword = "Admin@123";
            var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
            if (existingAdmin == null)
            {
                var adminUser = new User("Jamaat Admin", adminEmail, null);
                var createResult = await userManager.CreateAsync(adminUser, adminPassword);
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Administrator");
                }
            }

            // Demo accounts and records make every main workflow immediately testable.
            var organizer = await EnsureUserAsync(userManager, "organizer@jamaatconnect.com", "Demo Organizer", "+8801712345678", "Organizer");
            var participant = await EnsureUserAsync(userManager, "participant@jamaatconnect.com", "Demo Participant", "+8801812345678", "Participant");
            var moderator = await EnsureUserAsync(userManager, "moderator@jamaatconnect.com", "Demo Moderator", "+8801912345678", "Moderator");

            if (!await context.Listings.AnyAsync())
            {
                var dhaka = districts.First(d => d.Name == "Dhaka");
                var chattogram = districts.First(d => d.Name == "Chattogram");
                var approved = new Listing(organizer.Id, dhaka.Id, "Dhaka to Makkah Umrah Group", "Family-friendly guided Umrah group with hotel and transport included.", DateTime.UtcNow.AddDays(28), DateStatus.Confirmed, 12, null, "Makkah & Madinah", "Open");
                approved.AssignOrganizer(organizer.Id);
                approved.SetVerificationStatus(VerificationStatus.Verified);
                approved.SetPublicationStatus(PublicationStatus.Approved, DateTime.UtcNow);

                var pending = new Listing(organizer.Id, chattogram.Id, "Chattogram Hajj Preparation Circle", "Small group preparation and travel coordination.", DateTime.UtcNow.AddDays(45), DateStatus.Confirmed, 18, null, "Saudi Arabia", "Limited seats");
                var changes = new Listing(organizer.Id, dhaka.Id, "Winter Umrah Package", "A flexible community travel package.", DateTime.UtcNow.AddDays(60), DateStatus.Undecided, 10, null, "Makkah", "Open");
                changes.SetPublicationStatus(PublicationStatus.ChangesRequested);
                context.Listings.AddRange(approved, pending, changes);
                await context.SaveChangesAsync();

                context.ListingContacts.Add(new ListingContact(approved.Id, organizer.Id, organizer.PhonePrivate!, organizer.Email, organizer.PhonePrivate, "WhatsApp"));
                context.Enquiries.Add(new Enquiry(approved.Id, participant.Id, participant.DisplayName, participant.PhonePrivate, participant.PhonePrivate, true, "I would like to know the expected package price."));
                context.ListingReports.Add(new ListingReport(pending.Id, participant.Id, "Other", "Please confirm the departure date before approval."));
                context.ModerationActions.Add(new ModerationAction(changes.Id, moderator.Id, "RequestChanges", "Please add the final departure date and package details."));
                await context.SaveChangesAsync();
            }

            await SeedRichDemoDataAsync(context, organizer, participant, moderator);
        }

        private static async Task<User> EnsureUserAsync(UserManager<User> userManager, string email, string displayName, string phone, string role)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user != null) return user;
            user = new User(displayName, email, phone) { EmailConfirmed = true };
            var result = await userManager.CreateAsync(user, "Demo@123");
            if (!result.Succeeded) throw new InvalidOperationException($"Could not seed {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            await userManager.AddToRoleAsync(user, role);
            return user;
        }

        private static async Task SeedDemoDataForExistingDatabaseAsync(JamaatContext context, UserManager<User> userManager)
        {
            var organizer = await EnsureUserAsync(userManager, "organizer@jamaatconnect.com", "Demo Organizer", "+8801712345678", "Organizer");
            var participant = await EnsureUserAsync(userManager, "participant@jamaatconnect.com", "Demo Participant", "+8801812345678", "Participant");
            var moderator = await EnsureUserAsync(userManager, "moderator@jamaatconnect.com", "Demo Moderator", "+8801912345678", "Moderator");
            await SeedRichDemoDataAsync(context, organizer, participant, moderator);
        }

        private static async Task SeedRichDemoDataAsync(JamaatContext context, User organizer, User participant, User moderator)
        {
            const string markerTitle = "Sylhet Family Umrah Departure";
            if (await context.Listings.AnyAsync(l => l.Title == markerTitle)) return;

            var locations = await context.Locations.Where(l => l.Level == 2).ToListAsync();
            Guid LocationId(string name) => locations.First(l => l.Name == name).Id;
            var now = DateTime.UtcNow;

            var sylhetApproved = new Listing(organizer.Id, LocationId("Sylhet"), markerTitle, "A family-oriented Umrah group with experienced guides, accommodation and local transport.", now.AddDays(21), DateStatus.Confirmed, 11, null, "Makkah and Madinah", "Open");
            sylhetApproved.AssignOrganizer(organizer.Id);
            sylhetApproved.SetVerificationStatus(VerificationStatus.Verified);
            sylhetApproved.SetPublicationStatus(PublicationStatus.Approved, now);

            var rajshahiApproved = new Listing(organizer.Id, LocationId("Rajshahi"), "Rajshahi Community Umrah Group", "Shared community package with an orientation session before travel.", now.AddDays(36), DateStatus.Confirmed, 13, null, "Makkah", "8 seats left");
            rajshahiApproved.AssignOrganizer(organizer.Id);
            rajshahiApproved.SetVerificationStatus(VerificationStatus.Verified);
            rajshahiApproved.SetPublicationStatus(PublicationStatus.Approved, now);

            var khulnaPending = new Listing(organizer.Id, LocationId("Khulna"), "Khulna Umrah Travel Coordination", "Community travel coordination awaiting moderation.", now.AddDays(48), DateStatus.Confirmed, 12, null, "Saudi Arabia", "Open");
            var rangpurPending = new Listing(organizer.Id, LocationId("Rangpur"), "Rangpur Hajj Information Group", "Information and coordination for prospective Hajj pilgrims.", now.AddDays(75), DateStatus.Undecided, 20, null, "Makkah and Madinah", "Waiting list");
            var barishalChanges = new Listing(organizer.Id, LocationId("Barishal"), "Barishal Guided Umrah Package", "Package requires its final hotel information before publication.", now.AddDays(30), DateStatus.Confirmed, 10, null, "Makkah", "Open");
            barishalChanges.SetPublicationStatus(PublicationStatus.ChangesRequested);
            var coxsBazarRejected = new Listing(organizer.Id, LocationId("Cox's Bazar"), "Cox's Bazar Umrah Offer", "An incomplete submission retained to test rejected-listing views.", now.AddDays(50), DateStatus.Undecided, 9, null, "Madinah", "Closed");
            coxsBazarRejected.SetPublicationStatus(PublicationStatus.Rejected);
            coxsBazarRejected.SetVerificationStatus(VerificationStatus.Rejected);
            var gazipurSuspended = new Listing(organizer.Id, LocationId("Gazipur"), "Gazipur Pilgrim Support Group", "A suspended sample listing for administration and moderation testing.", now.AddDays(40), DateStatus.Confirmed, 14, null, "Makkah", "Unavailable");
            gazipurSuspended.SetPublicationStatus(PublicationStatus.Suspended);

            context.Listings.AddRange(sylhetApproved, rajshahiApproved, khulnaPending, rangpurPending, barishalChanges, coxsBazarRejected, gazipurSuspended);
            await context.SaveChangesAsync();

            context.ListingContacts.AddRange(
                new ListingContact(sylhetApproved.Id, organizer.Id, organizer.PhonePrivate!, organizer.Email, organizer.PhonePrivate, "WhatsApp"),
                new ListingContact(rajshahiApproved.Id, organizer.Id, organizer.PhonePrivate!, organizer.Email, organizer.PhonePrivate, "Phone"));

            var priceEnquiry = new Enquiry(sylhetApproved.Id, participant.Id, participant.DisplayName, participant.PhonePrivate, participant.PhonePrivate, true, "Could you share the package price and payment schedule?");
            var seatsEnquiry = new Enquiry(rajshahiApproved.Id, participant.Id, participant.DisplayName, participant.PhonePrivate, participant.PhonePrivate, true, "Are there still seats for two family members?");
            seatsEnquiry.SetStatus("Contacted");
            var pendingEnquiry = new Enquiry(khulnaPending.Id, participant.Id, participant.DisplayName, participant.PhonePrivate, null, false, "Please let me know once the date is confirmed.");
            context.Enquiries.AddRange(priceEnquiry, seatsEnquiry, pendingEnquiry);

            var activeReport = new ListingReport(rangpurPending.Id, participant.Id, "Misleading", "The departure date should be clarified before people make plans.");
            var reviewedReport = new ListingReport(coxsBazarRejected.Id, participant.Id, "Duplicate", "This appears similar to an existing package.");
            reviewedReport.SetStatus("Reviewed");
            context.ListingReports.AddRange(activeReport, reviewedReport);
            context.ModerationActions.AddRange(
                new ModerationAction(barishalChanges.Id, moderator.Id, "RequestChanges", "Add hotel details and the final group size."),
                new ModerationAction(coxsBazarRejected.Id, moderator.Id, "Reject", "The submitted information is incomplete."),
                new ModerationAction(gazipurSuspended.Id, moderator.Id, "Suspend", "This sample demonstrates the suspended state."));
            await context.SaveChangesAsync();
        }
    }
}
