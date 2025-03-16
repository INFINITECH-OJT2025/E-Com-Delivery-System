// components/PartnerSection.tsx
export const PartnerSection = () => {
    return (
      <section className="relative bg-primary py-16">
        <div className="container mx-auto flex justify-between items-center">
          {/* Video Embed on the Left */}
          <div className="relative w-full max-w-4xl">
            <div className="relative overflow-hidden rounded-lg shadow-lg aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/cNOKQIw81SE"
                title="Partner with foodpanda"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
  
          {/* Text Overlay on the Right */}
          <div className="w-full max-w-xl pl-10 text-white">
            <h2 className="text-3xl md:text-4xl font-bold">Partner with foodpanda today</h2>
            <p className="text-lg mt-4">
              Take your business to the next level by reaching new customers and boosting your sales!
            </p>
          </div>
        </div>
      </section>
    );
  };
  