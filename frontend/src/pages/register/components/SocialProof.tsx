import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const SocialProof = () => {
  const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Studio Director',
    company: 'Render Vision Studios',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b0a0c064-1763293437215.png",
    avatarAlt: 'Professional headshot of woman with blonde hair in business attire smiling warmly',
    quote: 'Visualise CRM transformed how we manage our international clients. The visual pipeline is a game-changer.',
    rating: 5
  },
  {
    name: 'Marcus Chen',
    role: 'Lead Architect',
    company: 'Pixel Perfect Design',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d0689ca5-1763296168465.png",
    avatarAlt: 'Professional headshot of Asian man with glasses in dark suit with confident expression',
    quote: 'Finally, a CRM that understands creative workflows. Our project closure rate increased by 40%.',
    rating: 5
  }];


  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Icon name="Star" size={20} color="var(--color-accent)" className="fill-accent" />
          <Icon name="Star" size={20} color="var(--color-accent)" className="fill-accent" />
          <Icon name="Star" size={20} color="var(--color-accent)" className="fill-accent" />
          <Icon name="Star" size={20} color="var(--color-accent)" className="fill-accent" />
          <Icon name="Star" size={20} color="var(--color-accent)" className="fill-accent" />
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Trusted by 500+ architectural visualization studios worldwide
        </p>
      </div>
      <div className="space-y-3 md:space-y-4">
        {testimonials?.map((testimonial, index) =>
        <div
          key={index}
          className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-soft-sm">

            <div className="flex items-start gap-3 md:gap-4 mb-3">
              {testimonial?.avatar ? (
              <Image
              src={testimonial.avatar}
              alt={testimonial.avatarAlt}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-border" />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-border text-base md:text-lg font-bold text-primary">
                {testimonial?.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}

              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-semibold text-foreground">
                  {testimonial?.name}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {testimonial?.role} at {testimonial?.company}
                </p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(testimonial?.rating)]?.map((_, i) =>
              <Icon
                key={i}
                name="Star"
                size={14}
                color="var(--color-accent)"
                className="fill-accent" />

              )}
              </div>
            </div>
            <p className="text-xs md:text-sm text-foreground/80 line-clamp-3">
              "{testimonial?.quote}"
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-6 md:gap-8 pt-2">
        <div className="text-center">
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
            500+
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">Studios</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
            10K+
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">Projects</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
            98%
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">Satisfaction</p>
        </div>
      </div>
    </div>);

};

export default SocialProof;
