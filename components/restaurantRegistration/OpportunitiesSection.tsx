// components/OpportunitiesSection.tsx
export const OpportunitiesSection = () => (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-900">
          E-com Delivery Service brings <span className="text-primary">new opportunities</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center">
            <img
              src="/images/main_icon.png"
              alt="Connect With New Customers"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect With New Customers</h3>
            <p className="text-gray-600 text-center">
              Adding your business to the platform means access to thousands of new customers in different
              neighborhoods.
            </p>
          </div>
  
          <div className="flex flex-col items-center">
            <img
              src="/images/main_icon.png"
              alt="Unlock Revenue"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Unlock Revenue</h3>
            <p className="text-gray-600 text-center">
              Let customers enjoy your business from anywhere, and capture the interest of new ones who haven't tried it yet.
            </p>
          </div>
  
          <div className="flex flex-col items-center">
            <img
              src="/images/main_icon.png"
              alt="Focus on Your Business"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Focus on Your Business</h3>
            <p className="text-gray-600 text-center">
              We take care of all the payments and customer support, whilst our foodpanda riders take care of the delivery.
              Leaving you to focus on what matters!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
  