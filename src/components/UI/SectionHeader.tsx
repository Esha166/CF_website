const SectionHeader = ({ title, description }: { title: string, description?: string }) => {
  return (
    <div className="text-center md:mb-12 font-inter mt-10">
      <h2 className="text-2xl md:text-4xl font-bold text-primary-800 mb-3 uppercase">
        {title}
      </h2>

      {description && (
        <p className="text-gray-950 text-sm md:text-base font-normal">
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionHeader