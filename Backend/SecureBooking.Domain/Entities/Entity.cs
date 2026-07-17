namespace SecureBooking.Domain.Entities
{
    public class Entity
    {
        public Guid Id {get; protected set;}
        public DateTime CreatedAt {get; private set;} = DateTime.UtcNow;
        public DateTime UpdatedAt {get; protected set;}

        
    }
}