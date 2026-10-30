import { motion, useReducedMotion } from 'framer-motion';

/** One gentle reveal per block as it enters the viewport. Skipped for reduced motion. */
export default function Reveal({ as = 'div', className, children, delay = 0, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
