// components/TestimonialSection.tsx
export const TestimonialSection = () => {
    return (
      <section className="bg-primary py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-10">What Our Partners Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <img src="/images/inifnitech_default_profile2.jpg" alt="Testimonial 1" className="w-16 h-16 rounded-full object-cover"/>
              </div>
              <p className="text-xl text-gray-700 mb-4">
                "The platform provided an opportunity for our brands to be readily accessible to customers whenever and wherever they are."
              </p>
              <h4 className="text-lg font-semibold">Lorent Adrias</h4>
              <p className="text-sm text-gray-500">Kenny Rogers Group</p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <img src="/images/inifnitech_default_profile3.jpg" alt="Testimonial 2" className="w-16 h-16 rounded-full object-cover"/>
              </div>
              <p className="text-xl text-gray-700 mb-4">
                "Apart from their strong consumer base, foodpanda always ensures that we grow our business together. Thank you foodpanda!"
              </p>
              <h4 className="text-lg font-semibold">Mark Embino</h4>
              <p className="text-sm text-gray-500">Minute Burger</p>
            </div>
  
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <img src="/images/inifnitech_default_profile4.jpg" alt="Testimonial 3" className="w-16 h-16 rounded-full object-cover"/>
              </div>
              <p className="text-xl text-gray-700 mb-4">
                "Foodpanda helped us reach new markets and increase our sales significantly. We are proud to be their partners."
              </p>
              <h4 className="text-lg font-semibold">John Doe</h4>
              <p className="text-sm text-gray-500">Burger King</p>
            </div>
          </div>
        </div>
      </section>
    );
  };
  